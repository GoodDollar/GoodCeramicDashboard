const { createReadStream } = require('fs')
const { get } = require('lodash')
const axios = require('axios');
const FormData = require('form-data');

class Ipfs {
  /** @private */
  constructor(config) {
    this.ipfsGateway = config.ipfsGateway
  }

  async store(filePath) {
    const stream = createReadStream(filePath)
    const formData = new FormData()
    formData.append('file',stream)
    const { data } = await axios.post(this.ipfsGateway,formData,
      {headers: {
          'Origin':'https://localhost',
          ...formData.getHeaders()
      }})
    return get(data, 'cid')
  }
}

module.exports = ({ strapi }) => {
  const { config } = strapi
  const ipfsConfig = config.get('plugin.ceramic-feed')

  return new Ipfs(ipfsConfig)
};
