const { join } = require('path');
const { keys, get, pick, map } = require('lodash');
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

  get assets() {
    const { db } = this.strapi

    return db.query('plugin::upload.file')
  }

  constructor(strapi, attributes) {
    const fields = keys(attributes).filter(field => 'cid' !== field)

    this.strapi = strapi
    this.fields = fields
    this.mediaFields = fields.filter(field => 'media' === get(attributes, `${field}.type`))
  }

  async beforeCreate({ params }) {
    const { data } = params
    const { ceramic, fields, mediaFields } = this
    const payload = pick(data, fields)

    await Promise.all(mediaFields.map(async field => {
      const filePath = await this._filePath(payload[field])

      payload[field] = filePath
    }))

    const { id } = await ceramic.create(payload)

    data.cid = id
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

    await ceramic.delete(result.cid)
  }

  async beforeDeleteMany({ params }) {
    const { ceramic, posts } = this
    const { where } = params

    const ids = await posts
      .findMany({ select: ['cid'], where })
      .then(records => map(records, 'cid'))

    await Promise.all(ids, async id => ceramic.delete(id))
  }

  /** @private */
  _publicPath(path) {
    const { dirs } = this.strapi

    return join(dirs.public, path)
  }

  /** @private */
  async _filePath(id) {
    const { url } = await this.assets.findOne({
      select: ['url'],
      where: { id },
    })

    return this._publicPath(url)
  }
}(strapi, schema.attributes)

module.exports = {
  async beforeCreate(event) {
    return LifecycleHooks.beforeCreate(event)
  },

  async afterUpdate(event) {
    return LifecycleHooks.afterUpdate(event)
  },

  async afterDelete(event) {
    return LifecycleHooks.afterDelete(event)
  },

  async beforeDeleteMany(event) {
    return LifecycleHooks.beforeDeleteMany(event)
  }
}
