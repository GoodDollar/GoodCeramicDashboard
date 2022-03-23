const { join } = require('path');
const { keys, get, pick } = require('lodash');
const schema = require('./schema');

const LifecycleHooks = new class {
  get ceramic() {
    const { strapi } = this

    return strapi.service('plugin::ceramic-feed.ceramicClient')
  }

  constructor(strapi, attributes) {
    const fields = keys(attributes).filter(field => 'cid' !== field)

    this.strapi = strapi
    this.fields = fields
    this.mediaFields = fields.filter(field => 'media' === get(attributes, `${field}.type`))
  }

  async afterCreate({ params, result }) {
    const { data } = params
    const { ceramic, fields, mediaFields } = this
    const payload = pick(data, fields)

    mediaFields.forEach(field => {
      const { url } = result[field]

      payload[field] = this._publicPath(url)
    })

    await Promise.all(mediaFields.map(async field => {
      const filePath = await this._filePath(payload[field])

      payload[field] = filePath
    }))

    const { id } = await ceramic.create(payload)

    data.cid = id

	await strapi.db.query('plugin::ceramic-feed.ceramic-post').update({ 
		where: { id: result.id },
		data: { cid: id }
	  }
	)
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

  async afterDelete({ result }) {
    const { ceramic } = this

    await ceramic.delete(result.cid)
  }

  /** @private */
  _publicPath(path) {
    const { dirs } = this.strapi

    return join(dirs.public, path)
  }

  /** @private */
  async _filePath(id) {
    const { entityService } = this.strapi

    const { url } = await entityService.findOne('plugin::upload.file', id, {
      fields: ['url'],
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
  }
}
