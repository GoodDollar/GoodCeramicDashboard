const { assign } = require('lodash')

const { metadata } = require('../../utils')
const CeramicModel = require('./CeramicModel')

class Post extends CeramicModel {
  static family = 'Post'
}

class CeramicClient {
  ipfs = null
  mediaFields = null

  constructor(strapi, schema) {
    const { mediaFields } = metadata.getFieldsNames(schema)
    const ipfs = strapi.service('plugin::ceramic-feed.ipfs')

    assign(this, { ipfs, mediaFields })
  }

  async unpublish(id) {
    return Feed.unpublish(id)
  }
}

module.exports = { CeramicClient, Post }
