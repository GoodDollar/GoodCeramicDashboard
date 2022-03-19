'use strict';

module.exports = {
  default: ({ env }) => ({
    direct: env.bool('CERAMIC_DIRECT', false),
    ceramicRESTApiURL: env('CERAMIC_REST_API_URL', 'http://127.0.0.1:3333'),
    ceramicNodeURL: env('CERAMIC_NODE_URL', 'https://ceramic-clay.3boxlabs.com'),
    pinataBaseUrl: env('PINATA_API_URL', 'https://api.pinata.cloud'),
    ipfsGateways: env('IPFS_GATEWAYS', 'https://cloudflare-ipfs.com/ipfs/{cid},https://ipfs.io/ipfs/{cid},https://{cid}.ipfs.dweb.link'),
  }),
  validator({ direct, ...config }) {
    const optionsMap = {
      true: ['ceramicRESTApiURL', 'ceramicRESTApiToken'],
      false: ['ceramicNodeURL', 'ceramicDIDSeed', 'pinataBaseUrl', 'pinataApiKey', 'pinataSecret', 'ipfsGateways']
    }

    optionsMap[direct].forEach(option => {
      if (!config[option]) {
        throw new Error(
          `${direct ? 'Direct' : 'REST API'} connection to the Ceramic networks requires '${option}' option to be set.`
        )
      }
    })
  },
};
