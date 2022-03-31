const { createReadStream } = require('fs')
const { get } = require('lodash')
const PinataSDK = require('@pinata/sdk')

class Ipfs {
  /** @private */
  ipfs = null

  /** @private */
  ipfsOptions = {
    pinataOptions: {
      cidVersion: 0
    }
  }

  constructor(ipfsFactory, config) {
    const { pinataApiKey, pinataSecret } = config

    this.ipfs = ipfsFactory(pinataApiKey, pinataSecret)
  }

  async store(filePath) {
    const { ipfs, ipfsOptions } = this
    const stream = createReadStream(filePath)
    const response = await ipfs.pinFileToIPFS(stream, ipfsOptions)

    return get(response, 'IpfsHash')
  }
}

module.exports = ({ strapi }) => {
  const { config } = strapi
  const ipfsConfig = config.get('plugin.ceramic-feed')

  return new Ipfs(PinataSDK, ipfsConfig)
};
