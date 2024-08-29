'use strict'

const bootstrapStoreSettings = require('./bootstrap/store-settings')
// const bootstrapCeramicNetwork = require('./bootstrap/ceramic-network')

module.exports = async ({ strapi }) => {
  const { db } = strapi
  // const { ceramicNodeURL, ceramicDIDSeed } = config.get('plugin.ceramic-feed')

  await bootstrapStoreSettings(db)
  // await bootstrapCeramicNetwork(ceramicNodeURL, ceramicDIDSeed)
}
