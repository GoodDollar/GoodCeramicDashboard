class CeramicClient {
  strapi = null
  config = null

  constructor(strapi, config) {
    this.strapi = strapi
    this.config = config
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
