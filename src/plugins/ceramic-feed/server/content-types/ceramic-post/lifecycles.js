const { join } = require('path');
const { assign, keys, get, pick, map, filter } = require('lodash');

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

  async afterUpdate({ params, result }) {
    const { data } = params
    const { ceramic, fields, mediaFields } = this
    const payload = pick(data, fields)

    mediaFields.forEach(field => {
      const { url } = result[field]

      payload[field] = this._publicPath(url)
    })

    await ceramic.update(data.cid, payload)
  }

  async afterDelete({ result, params }) {
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

  async beforeDeleteMany({ params }) {
    const { ceramic, posts } = this
    const { where } = params

    const ids = await posts
      .findMany({ select: ['cid'], where })
      .then(records => map(records, 'cid'))

    await Promise.all(filter(ids), async id => ceramic.unpublish(id))
  }

  /** @private */
  _publicPath(path) {
    const { dirs } = this.strapi

    return join(dirs.public, path)
  }
}(strapi, schema)

module.exports = {
  async afterUpdate(event) {
    console.log('afterUpdate', event)
    //return LifecycleHooks.afterUpdate(event)
  },

  async afterDelete(event) {
    return LifecycleHooks.afterDelete(event)
  },

  async beforeDeleteMany(event) {
    return LifecycleHooks.beforeDeleteMany(event)
  }
}
