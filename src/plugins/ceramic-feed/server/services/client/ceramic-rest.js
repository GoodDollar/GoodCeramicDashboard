const axios = require('axios')
const CeramicClient = require('./ceramic-client')

class RESTClient extends CeramicClient {
  http = null

  constructor(strapi, config, httpFactory) {
    super(strapi, config)

    const { ceramicRESTApiToken, ceramicRESTApiURL } = config
    const httpClient = httpFactory({
      baseURL: ceramicRESTApiURL,
      headers: { Authorization: `Bearer ${ceramicRESTApiToken}` }
    })

    httpClient.interceptors.response.use(
      ({ data }) => data,
      async error => { throw error }
    )

    this.http = httpClient
  }

  async create(payload) {
    console.log('create post', payload)

    return {}
  }

  async update(id, payload) {
    console.log('update post', { id, payload })

    return {}
  }

  async delete(id) {
    console.log('delete post', id)

    return {}
  }
}

module.exports = function(strapi, config) {
  return new RESTClient(strapi, config, axios.create)
}
