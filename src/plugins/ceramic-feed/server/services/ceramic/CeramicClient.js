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

  async updateAndPublish(id, payload) {
    const content = await this._getContent(payload)
    const document = await Post.load(id)

    return Post.updateAndPublish(document, content)
  }

  async unpublish(id) {
    return Post.unpublish(id)
  }

  /**
   * @private
   * Transforms json payload to the document's content
  */
  async _getContent(payload) {
    const { ipfs, mediaFields } = this
    const content = clone(payload)

    // loop over media (file upload) fields
    await withArray(mediaFields, async field => {
      // skip if no file in payload (e.g. image wasn't changed)
      if (field in payload) {
        let ipfsCID = null
        const filePath = content[field]

        // if file path was set - upload to IPFS
        // and store CID in document's content
        // otherwise (e.g. image was removed) set CID to null
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
