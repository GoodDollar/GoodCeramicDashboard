const { createReadStream } = require('fs')
const { get } = require('lodash')
const axios = require('axios');
const FormData = require('form-data');

class Ipfs {
  /** @private */
  constructor(config) {
    this.web3storageGateway = config.web3storageGateway
  }

  async store(filePath) {
    const stream = createReadStream(filePath)
    const formData = new FormData()
    formData.append('file',stream)
    const { data } = await axios.post(this.web3storageGateway,formData,
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
