const { assign, clone } = require('lodash')

const CeramicModel = require('./CeramicModel')
const { metadata } = require('../../utils')
const { withArray } = require('../../utils/async')

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

  async createAndPublish(payload) {
    const content = await this._getContent(payload)

    return Post.createAndPublish(content)
  }

  async updateAndPublish(cid, payload) {
    const content = await this._getContent(payload)
    const document = await Post.load(cid)

    return Post.updateAndPublish(document, content)
  }

  async unpublish(cid) {
    return Post.unpublish(cid)
  }

  /** @private */
  async _getContent(payload) {
    const { ipfs, mediaFields } = this
    const content = clone(payload)

    await withArray(mediaFields, async field => {
      if (field in payload) {
        let ipfsCID = null
        const filePath = content[field]

        if (filePath) {
          ipfsCID = await ipfs.store(filePath)
        }

        content[field] = ipfsCID
      }
    })

    return content
  }
}

module.exports = { CeramicClient, Post }
