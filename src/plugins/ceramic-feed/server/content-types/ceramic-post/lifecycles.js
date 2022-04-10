const { assign, pick, map, mapValues, mapKeys, filter, fromPairs } = require('lodash')
const { metadata, array, object } = require('../../utils')

const { withArray } = require('../../utils/async')
const { schema, relations } = require('./datagram');

const { hasOnlyKeys } = object
const { resolveMediaFieldsPaths } = metadata

const LifecycleHooks = new class {
  get ceramic() {
    const { strapi } = this

    return strapi.service('plugin::ceramic-feed.ceramic')
  }

  get posts() {
    const { db } = this.strapi

    return db.query('plugin::ceramic-feed.ceramic-post')
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
  }

  async onPublish({ result }) {
    const { ceramic, posts } = this
    const { cid, publishedAt } = result

    // on publish we have to pre-fill
    // or update 'published' date field
    const payload = await this._readPayload(result)
      .then(data => ({ ...data, published: publishedAt }))

    // if Ceramic ID was set - update doc (with latest data)
    // and publish (by writing 'updated' event to the changelog)
    if (cid) {
      await ceramic.updateAndPublish(cid, payload)
      return
    }

    // if no Ceramic ID in document - create document
    // and write 'added' event to the changelog
    const document = await ceramic.createAndPublish(payload)
    const data = { cid: String(document.id) }
    const where = pick(result, 'id')

    // prefill result with Ceramic ID newly generated
    assign(result, data)
    // update post record with Ceramic IDs
    await posts.update({ where, data })
  }

  async onUpdate(event) {
    const { ceramic } = this
    const { params, result } = event
    const { publishedAt, cid } = result
    const { data, where } = params

    // id update payload have only 'cid' and 'updatedAt'
    // fields - this is the update query from onPublish()
    if (hasOnlyKeys(data, 'cid', 'updatedAt') && hasOnlyKeys(where, 'id')) {
      // if setting ceramic id on first publish - do nothing
      return
    }

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

    // if 'publishedAt' present in DOCUMENT (but absent in UPDATE PAYLOAD) that means
    // the published document was updated and nees to be also updated in Ceramic
    // before update we're checking is Ceramic ID is set
    if (publishedAt && cid) {
      const payload = await this._readPayload(result)

      await ceramic.updateAndPublish(cid, payload)
    }

    // if no 'publishedAt' present in DOCUMENT then means the DRAFT was updated we're skipping
    // updating of the drafts in Ceramic. they will be updated on the next re-publish
  }

  async onUnpublish({ result, params }) {
    const { ceramic } = this

    // afterDelete triggers once also at bulk remove
    // with specific where condition we could check for
    if ('$and' in params.where) {
      // skip on bulk remove
      return
    }

    // if non-bulk remove - getting ceramic
    // ID and unpublishing document
    const { cid } = result

    // do not try to remove the document wasn't published
    if (cid) {
      await ceramic.unpublish(cid)
    }
  }

  async onUnpublishMany({ params }) {
    const { ceramic, posts } = this
    const { where } = params

    const ids = await posts
      .findMany({ select: ['cid'], where })
      .then(records => map(records, 'cid'))

    await Promise.all(filter(ids).map(async id => ceramic.unpublish(id)))
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
    const payload = pick(entity, schema, fields)

    assign(payload, resolveMediaFieldsPaths(payload, mediaFields))

    if (!schemaName) {
      await withArray(relationFields, async field => {
        const relatedEntity = await this._loadRelation(entity, field)
        const entityPayload = await this._readPayload(relatedEntity, field)

        delete payload[field]
        assign(payload, mapKeys(entityPayload, (_, key) => relatedFieldName(key, field)))
      })
    }

    return payload
  }

  /** @private */
  async _loadRelation(entity, relation) {
    const { entityService, schema, schemas } = this
    const entityId = entity[relation].id
    const entityType = schema.relations[relation]
    const { mediaFields } = schemas[relation]

    return entityService.findOne(entityType, entityId, {
      populate: fromPairs(mediaFields.map(field => [field, true]))
    })
  }
}(strapi, schema, relations)

module.exports = {
  async afterUpdate(event) {
    return LifecycleHooks.onUpdate(event)
  },

  // we still need to listen for delete events
  // because physical removal should also unpublish
  // documents from Ceramic Network
  async afterDelete(event) {
    return LifecycleHooks.onUnpublish(event)
  },

  async beforeDeleteMany(event) {
    return LifecycleHooks.onUnpublishMany(event)
  }
}
