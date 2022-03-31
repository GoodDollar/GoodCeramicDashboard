const { join } = require('path');
const { assign, pick, map, filter, mapValues } = require('lodash');

const { metadata, array } = require('../../utils')
const schema = require('./schema');

const LifecycleHooks = new class {
  get ceramic() {
    const { strapi } = this

    return strapi.service('plugin::ceramic-feed.ceramicClient')
  }

  get posts() {
    const { db } = this.strapi

    return db.query('plugin::ceramic-feed.ceramic-post')
  }

  constructor(strapi, schema) {
    let { fields, mediaFields } = metadata.getFieldsNames(schema)
    fields = array.remove(fields, 'cid')

    assign(this, { strapi, fields, mediaFields })
  }

  async onPublish({ result }) {
    const { ceramic, posts } = this
    const { cid, publishedAt } = result

    const payload = {
      ...this._readPayload(result),
      published: publishedAt
    }

    if (cid) {
      await ceramic.updateAndPublish(cid, payload)
      return 
    }

    const document = await ceramic.createAndPublish(payload)
    const data = { cid: String(document.id) }
    const where = pick(result, 'id')
    
    assign(result, data)
    await posts.update({ where, data })
  }

  async onUpdate(event) {
    const { ceramic } = this
    const { params, result } = event
    const { publishedAt, cid } = result
    const { data, where } = params

    if (('cid' in data) && ('id' in where)) {
      return
    }
    
    if ('publishedAt' in data) {
      if (data.publishedAt) {
        return this.onPublish(event)
      }

      return this.onUnpublish(event)
    }

    if (publishedAt && cid) {
      const payload = this._readPayload(result)

      await ceramic.updateAndPublish(cid, payload)
    }
  }

  async onUnpublish({ result, params }) {
    const { ceramic } = this

    if ('$and' in params.where) {
      // skip on bulk remove
      return
    }

    const { cid } = result

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

    await Promise.all(filter(ids), async id => ceramic.unpublish(id))
  }

  /** @private */
  _readPayload(result) {
    const { fields, mediaFields, strapi } = this
    const { dirs } = strapi
    
    return mapValues(pick(result, fields), (value, field) => {
      if (mediaFields.includes(field)) {
        const { url } = value

        return join(dirs.public, url)
      }

      return value
    })
  }
}(strapi, schema)

module.exports = {
  async afterUpdate(event) {
    return LifecycleHooks.onUpdate(event)
  },

  async afterDelete(event) {
    return LifecycleHooks.onUnpublish(event)
  },

  async beforeDeleteMany(event) {
    return LifecycleHooks.onUnpublishMany(event)
  }
}
