const { DID } = require('dids')
const { assign } = require('lodash')
const { fromString } = require('uint8arrays')
const { getResolver } = require('key-did-resolver')
const { CeramicClient } = require('@ceramicnetwork/http-client')
const { Ed25519Provider } = require('key-did-provider-ed25519')

const CeramicModel = require('../services/ceramic/CeramicModel')

module.exports = async (ceramicNodeURL, ceramicDIDSeed) => {
  const ceramic = new CeramicClient(ceramicNodeURL)
  const key = fromString(ceramicDIDSeed, 'base16')

  // initialize DID with provider and resolver
  const did = new DID({
    provider: new Ed25519Provider(key),
    resolver: getResolver()
  })

  // Authenticate the DID with the provider
  await did.authenticate()
  assign(ceramic, { did })

  // supply ceramic instance to CeramicModel
  assign(CeramicModel, { ceramic })
}
