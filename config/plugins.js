module.exports = ({ env }) => ({
  // ...
  'ceramic-feed': {
    enabled: true,
    resolve: './src/plugins/ceramic-feed',
    config: {
      ceramicNodeURL: env('CERAMIC_NODE_URL', 'https://ceramic-clay.3boxlabs.com'),
      ceramicDIDSeed: env('CERAMIC_DID_SEED'),
      pinataApiKey: env('PINATA_API_KEY'),
      pinataSecret: env('PINATA_SECRET'),
    },
  },
  // ...
})
