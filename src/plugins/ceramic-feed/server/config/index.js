'use strict';

module.exports = {
  default: ({ env }) => ({
    ceramicNodeURL: env('CERAMIC_NODE_URL', 'https://ceramic-clay.3boxlabs.com'),
    web3storageGateway: env('WEB3STORAGE_GATEWAY', 'https://ipfsgateway.goodworker.workers.dev'),
    orbisContext: env('ORBIS_FEED_CONTEXT', 'kjzl6cwe1jw147bfd2hn7f3j2sdsq6708xnb3a217iz1m18a35v25kgxna3s0os'),
    allowedOrigins: env.array('CERAMIC_FEED_ALLOWED_ORIGINS', [
      'http://localhost:1337',
      'http://127.0.0.1:1337',
      'http://0.0.0.0:1337',
      'http://localhost:3000',
      'https://localhost:3000',
      'https://localhost:1337',
      'https://127.0.0.1:1337',
    ]),
  }),
  validator(config) {
    const mandatoryOptions = ['ceramicNodeURL', 'ceramicDIDSeed', 'web3storageGateway']

    mandatoryOptions.forEach(option => {
      if (config[option]) {
        return
      }

      throw new Error(
        `Ceramic connection requires '${option}' option to be set.`
      )
    })
  },
};
