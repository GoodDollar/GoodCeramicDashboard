module.exports = ({ env }) => ({
  // ...
  'ceramic-feed': {
    enabled: true,
    resolve: './src/plugins/ceramic-feed',
    config: {
      web3storageGateway: env('WEB3STORAGE_GATEWAY', 'https://ipfsgateway.goodworker.workers.dev'),
      ceramicNodeURL: env('CERAMIC_NODE_URL', 'https://ceramic-clay.3boxlabs.com'),
      ceramicDIDSeed: env('CERAMIC_DID_SEED'),
    },
  },
  // ...
})
