const { createReadStream } = require('fs')
const axios = require('axios');
const FormData = require('form-data');
const  { CID } = require('multiformats/cid')

class Ipfs {
  /** @private */
  constructor(config, httpFactory) {
    const client = httpFactory({
      baseURL: config.web3storageGateway,
      headers: {
        'Origin': 'https://localhost' // the worker checks for specific origins
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

module.exports = ({ strapi }) => {
  const { config } = strapi
  const ipfsConfig = config.get('plugin.ceramic-feed')

  return new Ipfs(ipfsConfig, axios.create)
};
