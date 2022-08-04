const { asynchronous } = require('../../utils')

module.exports = () => asynchronous.import({
  DID: 'dids',
  getResolver: 'key-did-resolver',
  Ed25519Provider: 'key-did-provider-ed25519',
  CeramicClient: '@ceramicnetwork/http-client',
  TileDocument: '@ceramicnetwork/stream-tile'
})
