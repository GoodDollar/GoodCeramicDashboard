const { trimEnd } = require('lodash')
const { createReadStream } = require('fs')
const axios = require('axios');
const FormData = require('form-data');
const  { CID } = require('multiformats/cid')
const { getAbsoluteServerUrl } = require('@strapi/utils')

class Ipfs {
  /** @private */
  constructor(httpFactory, config) {
    const { web3storageGateway } = config.get('plugin.ceramic-feed')
    const client = httpFactory({
      baseURL: web3storageGateway,
      headers: {
        'Origin': trimEnd(getAbsoluteServerUrl(config), '/')
      }
    })

    client.interceptors.response.use(({ data }) => data)
    this.client = client
  }

  async store(filePath) {
    const stream = createReadStream(filePath)
    const payload = new FormData()

    payload.append('file', stream)

    const { cid } = await this.client.post('/', payload, {
      headers: payload.getHeaders()
    })

    return CID.parse(cid).toV1().toString()
  }
}

module.exports = ({ strapi }) => new Ipfs(axios.create, strapi.config);
