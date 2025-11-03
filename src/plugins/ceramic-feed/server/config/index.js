'use strict'
const { DEFAULT_ALLOWED_ORIGINS } = require('./defaults')

module.exports = {
  default: ({ env }) => ({
    ceramicNodeURL: env(
      'CERAMIC_NODE_URL',
      'https://ceramic-clay.3boxlabs.com'
    ),
    web3storageGateway: env(
      'WEB3STORAGE_GATEWAY',
      'https://ipfsgateway.goodworker.workers.dev'
    ),
    orbisContext: env(
      'ORBIS_FEED_CONTEXT',
      'kjzl6cwe1jw147bfd2hn7f3j2sdsq6708xnb3a217iz1m18a35v25kgxna3s0os'
    ),
    allowedOrigins: env.array('CERAMIC_FEED_ALLOWED_ORIGINS', [
      DEFAULT_ALLOWED_ORIGINS
    ])
  }),
  validator(config) {
    const mandatoryOptions = [
      'ceramicNodeURL',
      'ceramicDIDSeed',
      'web3storageGateway'
    ]

    mandatoryOptions.forEach(option => {
      if (config[option]) {
        return
      }

      throw new Error(
        `Ceramic connection requires '${option}' option to be set.`
      )
    })
  }
}
