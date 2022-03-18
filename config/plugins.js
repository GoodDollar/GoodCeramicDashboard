module.exports = ({ env }) => ({
  // ...
  'ceramic-feed': {
    enabled: true,
    resolve: './src/plugins/ceramic-feed',
    config: {
      direct: env.bool('CERAMIC_DIRECT', false),
      ceramicRESTApiURL: env('CERAMIC_REST_API_URL', 'http://127.0.0.1:3333'),
      ceramicNodeURL: env('CERAMIC_NODE_URL', 'https://ceramic-clay.3boxlabs.com'),
      ceramicDIDSeed: env('CERAMIC_DID_SEED'),
      pinataBaseUrl: env('PINATA_API_URL', 'https://api.pinata.cloud'),
      pinataApiKey: env('PINATA_API_KEY'),
      pinataSecret: env('PINATA_SECRET'),
      ipfsGateways: env('IPFS_GATEWAYS', 'https://cloudflare-ipfs.com/ipfs/{cid},https://ipfs.io/ipfs/{cid},https://{cid}.ipfs.dweb.link'),
    },
  },
  // ...
})
