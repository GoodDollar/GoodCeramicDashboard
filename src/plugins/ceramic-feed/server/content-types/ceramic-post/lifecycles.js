const { join } = require('path');
const { assign, keys, get, pick, mapValues } = require('lodash');
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

  constructor(strapi, attributes) {
    const fields = keys(attributes).filter(field => 'cid' !== field)

    this.strapi = strapi
    this.fields = fields
    this.mediaFields = fields.filter(field => 'media' === get(attributes, `${field}.type`))
  }

  async afterCreate(event) {
    const { posts, ceramic } = this
    const { result } = event

    const where = pick(result, 'id')
    const payload = this._processPayload(event)
    const data = await ceramic.create(payload)
      .then(({ id }) => ({ cid: id }))

	  await posts.update({ where, data })
    assign(result, data)
  }

  async afterUpdate(event) {
    const { ceramic } = this
    const { cid } = event.result
    const payload = this._processPayload(event)

    await ceramic.update(cid, payload)
  }

  async afterDelete(event) {
    const { ceramic } = this
    const { cid } = event.result

    await ceramic.delete(cid)
  }

  /** @private */
  _processPayload({ params, result }) {
    const { fields, mediaFields, strapi } = this
    const { data } = params
    const { dirs } = strapi

    return mapValues(pick(data, fields), (value, field) => {
      if (mediaFields.includes(field)) {
        const { url } = result[field]

        return join(dirs.public, url)
      }

      return value
    })
  }
}(strapi, schema.attributes)

module.exports = {
  async afterCreate(event) {
    return LifecycleHooks.afterCreate(event)
  },

  async afterUpdate(event) {
    return LifecycleHooks.afterUpdate(event)
  },

  async afterDelete(event) {
    return LifecycleHooks.afterDelete(event)
  }
}
