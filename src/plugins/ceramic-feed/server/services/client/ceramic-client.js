const { keys, get } = require('lodash')

class CeramicClient {
  strapi = null
  config = null
  mediaFields = null

  constructor(strapi, config, attributes) {
    this.strapi = strapi
    this.config = config
    this.mediaFields = keys(attributes).filter(field => 'media' === get(attributes, `${field}.type`))
  }

  async create(payload) {
    throw new Error('Method not implemented')
  }

  async update(id, payload) {
    throw new Error('Method not implemented')
  }

  async delete(id) {
    throw new Error('Method not implemented')
  }
}

module.exports = CeramicClient
