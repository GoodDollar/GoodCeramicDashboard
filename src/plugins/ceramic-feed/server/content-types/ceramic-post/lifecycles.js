const {
  assign,
  pick,
  map,
  mapValues,
  mapKeys,
  filter,
  isEmpty,
  isPlainObject,
  bindAll
} = require('lodash')
const { ApplicationError } = require('@strapi/utils').errors
const { metadata, array } = require('../../utils')

const { withArray } = require('../../utils/async')
const { schema, relations } = require('./datagram')

const { resolveMediaFieldsPaths, makePopulate } = metadata
const POSTS = 'plugin::ceramic-feed.ceramic-post'

const LifecycleHooks = new (class {
  get ceramic() {
    const { strapi } = this

    return strapi.service('plugin::ceramic-feed.ceramic')
  }

  get posts() {
    return this._query(POSTS)
  }

  get assets() {
    return this._query('plugin::upload.file')
  }

  get entityService() {
    const { entityService } = this.strapi

    return entityService
  }

  constructor(strapi, mainSchema, relatedSchemas) {
    const { _readSchema } = this
    const schema = _readSchema(mainSchema)
    const schemas = mapValues(relatedSchemas, _readSchema)

    assign(this, { strapi, schema, schemas })
    bindAll(this, '_callCeramic')
  }

  async onPublish(entity) {
    const { _callCeramic, entityService } = this

    const { cid, orbisId, publishedAt } = entity
    const published =
      publishedAt instanceof Date ? publishedAt.toISOString() : publishedAt

    // on publish we have to pre-fill
    // or update 'published' date field
    const payload = await this._readPayload(entity).then(data => ({
      ...data,
      published
    }))

    // if Ceramic ID was set - update doc (with latest data)
    // and publish (by writing 'updated' event to the changelog)
    if (cid) {
      await _callCeramic(async ceramic => {
        await ceramic.updateAndPublish(cid, orbisId, payload)
      })

      if (!orbisId) {
        console.log('no orbis id...')
        const data = await _callCeramic(async ceramic =>
          ceramic.syncOrbis(payload)
        )
        entityService.update(POSTS, entity.id, { data })
      }
      return
    }
    // if no Ceramic ID in document - create document
    // and write 'added' event to the changelog
    const data = await _callCeramic(async ceramic =>
      ceramic.createAndPublish(payload)
    )
    entityService.update(POSTS, entity.id, { data })
  }

  async onAfterUpdate(event) {
    const entity = event.result
    const { publishedAt } = entity

    //case 1. being or already published - update or create the record on ceramic
    if (publishedAt) {
      return this.onPublish(entity)
    }

    //case 2. being or already unpublished
    return this.onUnpublish(entity)
  }

  async onUnpublish(event) {
    const { params = {} } = event
    const { where, data } = params
    const { _callCeramic, posts } = this
    let ids

    // case for single unpublish
    if ('cid' in event) {
      ids = [[event.cid, event.orbisId]]
      // case for single delete
    } else if ('data' in params && 'cid' in data) {
      ids = [[data.cid, data.orbisId]]
    } else {
      //case for delete many
      // getting ceramic IDs querying posts table
      // by id/ids got from event's where conditions
      ids = await posts
        .findMany({ select: ['cid', 'orbisId'], where })
        .then(records => map(records, _ => [_.cid, _.orbisId]))
    }

    ids = filter(ids)

    if (isEmpty(ids)) {
      return
    }

    await _callCeramic(async ceramic => {
      // unpublishing document by ceramic ID
      await withArray(ids, async id => ceramic.unpublish(id[0], id[1]))
    })
  }

  /** @private */
  _readSchema(schema, schemaName = null) {
    const schemaMeta = metadata.getFieldsNames(schema)
    const { fields, mediaFields } = schemaMeta

    if (schemaName) {
      return { fields, mediaFields }
    }

    return { ...schemaMeta, fields: array.remove(fields, 'cid', 'orbisId') }
  }

  /**
   * @private
   * Reads payload and picks uploaded files paths up
   */
  async _readPayload(entity, schemaName = null) {
    const { schema, schemas } = this
    const { relatedFieldName } = metadata
    const entitySchema = schemaName ? schemas[schemaName] : schema
    const { fields, mediaFields, relationFields } = entitySchema

    const payload = pick(
      entity,
      array.remove(fields, ['publishWallet', 'publishDapp']) //converting to tags
    )

    //handle tags for orbis
    if (fields.includes('publishWallet')) {
      payload.tags = []
      if (entity.publishWallet)
        payload.tags.push({
          slug: 'publishWallet',
          title: 'Publish on goodwallet'
        })
      if (entity.publishDapp)
        payload.tags.push({
          slug: 'publishDapp',
          title: 'Publish on gooddapp'
        })
    }

    await withArray(mediaFields, async field => {
      payload[field] = await this._loadAsset(payload, field)
    })

    assign(payload, resolveMediaFieldsPaths(payload, mediaFields))

    if (!schemaName) {
      await withArray(relationFields, async field => {
        const relatedEntity = await this._loadRelation(entity, field)
        if (relatedEntity) {
          const entityPayload = await this._readPayload(relatedEntity, field)

          assign(
            payload,
            mapKeys(entityPayload, (_, key) => relatedFieldName(field, key))
          )
        }

        delete payload[field]
      })
    }

    return payload
  }

  /** @private */
  async _loadEntity(event) {
    const { where, data, populate } = event.params
    const post = await this._queryEntity(POSTS, where.id, { populate })

    return { ...post, ...data }
  }

  /** @private */
  async _loadRelation(entity, relation) {
    const { entityService, schema, schemas } = this
    const shortEntity = entity[relation]

    if (!shortEntity) {
      return
    }

    const entityId = isPlainObject(shortEntity) ? shortEntity.id : shortEntity
    const entityType = schema.relations[relation]
    const { mediaFields } = schemas[relation]

    return entityService.findOne(entityType, entityId, {
      populate: makePopulate(mediaFields)
    })
  }

  /** @private */
  async _loadAsset(entity, assetName) {
    const { assets } = this
    const media = entity[assetName]

    if (!media || isPlainObject(media)) {
      return media
    }

    return assets.findOne({ select: ['url'], where: { id: media } })
  }

  /** @private */
  _query(collection) {
    const { db } = this.strapi

    return db.query(collection)
  }

  /** @private */
  async _queryEntity(collection, id, options = {}) {
    const { entityService } = this.strapi

    return entityService.findOne(collection, id, options)
  }

  /** @private */
  async _callCeramic(callback) {
    try {
      return await callback(this.ceramic)
    } catch (e) {
      console.log('Error:', e)
      throw new ApplicationError(
        'Ceramic Network sync failed. Please try again later...'
      )
    }
  }
})(strapi, schema, relations)

module.exports = {
  // async beforeUpdate(event) {
  //   return LifecycleHooks.onUpdate(event)
  // },
  async afterUpdate(event) {
    LifecycleHooks.onAfterUpdate(event)
  },
  // we still need to listen for delete events
  // because physical removal should also unpublish
  // documents from Ceramic Network
  async beforeDelete(event) {
    return LifecycleHooks.onUnpublish(event)
  },

  async beforeDeleteMany(event) {
    return LifecycleHooks.onUnpublish(event)
  }
}
