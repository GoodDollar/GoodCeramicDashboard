// const { get, mapValues } = require('lodash')

// const colors = require('chalk')
const logger = require('../utils/logger')

const dotenv = require('dotenv')
// const env = require('@strapi/utils/lib/env-helper')
// const getPluginsConfig = require('../../../../../config/plugins')

// const { string } = require('../../server/utils')
// const { Post } = require('../../server/services/ceramic/CeramicOrbisClient')
// const bootstrapCeramicNetwork = require('../../server/bootstrap/ceramic-network')

;(async () => {
  try {
    // const envTmpl = string.mustache(
    //   `REACT_APP_CERAMIC_NODE_URL={ceramicNodeURL}\n` +
    //     `REACT_APP_CERAMIC_INDEX={postsIndex}\n` +
    //     `REACT_APP_CERAMIC_LIVE_INDEX={postsLiveIndex}`
    // )

    dotenv.config()

    // const config = getPluginsConfig({ env })
    // const { ceramicNodeURL, ceramicDIDSeed } = get(
    //   config,
    //   'ceramic-feed.config'
    // )

    // // await bootstrapCeramicNetwork(ceramicNodeURL, ceramicDIDSeed)

    // const { id: postsIndex } = await Post.getIndex()
    // const { id: postsLiveIndex } = await Post.getLiveIndex()
    // const settings = mapValues(
    //   { postsIndex, postsLiveIndex, ceramicNodeURL },
    //   String
    // )
    // const reactEnv = envTmpl(settings)

    // logger.info('Add the following lines to React App .env file:')
    // logger.info(`\n\n${colors.cyan(reactEnv)}\n`)
  } catch (exception) {
    logger.error(exception)
  }
})()
