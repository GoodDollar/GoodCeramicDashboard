const { readFile } = require('fs')
const { promisify } = require('util')

const axios = require('axios')
const mimeTypes = require('mime-types')
const { template, clone } = require('lodash')

const CeramicClient = require('./ceramic-client')
const readFileAsync = promisify(readFile)

class RESTClient extends CeramicClient {
  http = null
  dataUrlTmpl = template('data:{mime};base64,{base64}', { interpolate: /{(\S+?)}/g })

  constructor(strapi, config, attributes, httpFactory) {
    super(strapi, config, attributes)

    this.http = this._createHttpClient(config, httpFactory)
  }

  async create(payload) {
    const data = await this._processPayload(payload)

    return this.http.post('/posts', data)
  }

  async update(id, payload) {
    const data = await this._processPayload(payload)

    return this.http.put('/posts/:id', data, { params: { id } })
  }

  async delete(id) {
    return this.http.delete('/posts/:id', { params: { id } })
  }

  /** @private */
  async _processPayload(payload) {
    const { mediaFields, dataUrlTmpl } = this
    const result = clone(payload)

    await Promise.all(mediaFields.map(async field => {
      const path = payload[field]
      const mime = mimeTypes.lookup(path)
      const base64 = await readFileAsync(path, 'base64')

      result[field] = dataUrlTmpl({ mime, base64 })
    }))

    return result
  }

  _createHttpClient(config, httpFactory) {
    const { ceramicRESTApiToken, ceramicRESTApiURL } = config
    const httpClient = httpFactory({
      baseURL: ceramicRESTApiURL,
      headers: { Authorization: `Bearer ${ceramicRESTApiToken}` }
    })

    const { response, request } = httpClient.interceptors

    response.use(
      ({ data }) => data,
      async error => { throw error }
    )

    request.use(({ url, params, ...options }) => {
      const searchParams = params instanceof URLSearchParams ? params : new URLSearchParams(params || {})

      const substituteParameter = (_, parameter) => {
        const parameterValue = searchParams.get(parameter) || ''

        searchParams.delete(parameter)
        return encodeURIComponent(parameterValue)
      }

      return {
        ...options,
        params: searchParams,
        url: (url || '').replace(/:(\w[\w\d]+)/g, substituteParameter)
      }
    })

    return httpClient
  }
}

module.exports = function(strapi, config, attributes) {
  return new RESTClient(strapi, config, attributes, axios.create)
}
