const { assign, pick, map, mapValues, mapKeys, filter, isEmpty, isPlainObject, bindAll } = require('lodash')

const { ApplicationError } = require('@strapi/utils').errors;
const { metadata, array } = require('../../utils')

const { withArray } = require('../../utils/async')
const { schema, relations } = require('./datagram');

const { resolveMediaFieldsPaths, makePopulate } = metadata
const POSTS = 'plugin::ceramic-feed.ceramic-post'

const LifecycleHooks = new class {
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

  async onPublish(event) {
    const { _callCeramic } = this
    const entity = await this._loadEntity(event)
    const { cid, publishedAt } = entity

    // on publish we have to pre-fill
    // or update 'published' date field
    const payload = await this._readPayload(entity)
      .then(data => ({ ...data, published: publishedAt }))

    // if Ceramic ID was set - update doc (with latest data)
    // and publish (by writing 'updated' event to the changelog)
    if (cid) {
      await _callCeramic(async ceramic => {
        await ceramic.updateAndPublish(cid, payload)
      })

      return
    }

    // if no Ceramic ID in document - create document
    // and write 'added' event to the changelog
    const document = await _callCeramic(async ceramic => ceramic.createAndPublish(payload))

    // prefill data with Ceramic ID newly generated
    event.data.cid = String(document.id)
  }

  async onUpdate(event) {
    const { _callCeramic } = this
    const { data } = event.params

    // if 'publishedAt' present in update PAYLOAD - publish or unpublish
    // button was pressed, there's no other cases where this field
    // could be presented in payload
    if ('publishedAt' in data) {
      // if publishedAt is set - publishing document
      if (data.publishedAt) {
        return this.onPublish(event)
      }

      // if publishedAt is null - unpublishing it
      return this.onUnpublish(event)
    }

    const entity = await this._loadEntity(event)
    const { publishedAt, cid } = entity

    // if 'publishedAt' present in DOCUMENT (but absent in UPDATE PAYLOAD) that means
    // the published document was updated and nees to be also updated in Ceramic
    // before update we're checking is Ceramic ID is set
    if (publishedAt && cid) {
      const payload = await this._readPayload(entity)

      await _callCeramic(async ceramic => {
        await ceramic.updateAndPublish(cid, payload)
      })
    }

    // if no 'publishedAt' present in DOCUMENT then means the DRAFT was updated we're skipping
    // updating of the drafts in Ceramic. they will be updated on the next re-publish
  }

  async onUnpublish(event) {
    const { params } = event
    const { where, data } = params
    const { _callCeramic, posts } = this
    let ids

    if (('data' in params) && ('cid' in data)) {
      ids = [data.cid]
    } else {
      // getting ceramic IDs querying posts table
      // by id/ids got from event's where conditions
      ids = await posts
        .findMany({ select: ['cid'], where })
        .then(records => map(records, 'cid'))
    }

    ids = filter(ids)

    if (isEmpty(ids)) {
      return
    }

    await _callCeramic(async ceramic => {
      // unpublishing document by ceramic ID
      await withArray(ids, async id => ceramic.unpublish(id))
    })
  }

  /** @private */
  _readSchema(schema, schemaName = null) {
    const schemaMeta = metadata.getFieldsNames(schema)
    const { fields, mediaFields } = schemaMeta

    if (schemaName) {
      return { fields, mediaFields }
    }

    return { ...schemaMeta, fields: array.remove(fields, 'cid') }
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
    const payload = pick(entity, fields)

    await withArray(mediaFields, async field => {
      payload[field] = await this._loadAsset(payload, field)
    })

    assign(payload, resolveMediaFieldsPaths(payload, mediaFields))

    if (!schemaName) {
      await withArray(relationFields, async field => {
        const relatedEntity = await this._loadRelation(entity, field)

        if (relatedEntity) {
          const entityPayload = await this._readPayload(relatedEntity, field)

          assign(payload, mapKeys(entityPayload, (_, key) => relatedFieldName(field, key)))
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

    return assets.findOne({ select: ['url'], where: { id: media }})
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
      console.log(e)
      throw new ApplicationError('Ceramic Network sync failed. Please try again later...')
    }
  }
}(strapi, schema, relations)

module.exports = {
  async beforeUpdate(event) {
    console.log(event)
    return LifecycleHooks.onUpdate(event)
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
