const mime = require('mime-types')
const { assign, clone, toPairs } = require('lodash')

const CeramicModel = require('./CeramicModel')
const { metadata, filesystem } = require('../../utils')
const { withArray } = require('../../utils/async')

class Post extends CeramicModel {
  static family = 'Post'
}

class CeramicClient {
  ipfs = null
  mediaFields = null

  constructor(strapi, schema, relatedSchemas) {
    const { _getMediaFields } = this
    const ipfs = strapi.service('plugin::ceramic-feed.ipfs')
    const { relatedFieldName } = metadata

    const mediaFields = toPairs(relatedSchemas).reduce(
      (fields, [field, relatedSchema]) => {
        const relatedMedia = _getMediaFields(relatedSchema)

        return [...fields, relatedMedia.map(
          relatedField => relatedFieldName(field, relatedField)
        )]
      },
      _getMediaFields(schema)
    )

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
        let fieldValue = null
        const filePath = content[field]

        // if file path was set - process
        if (filePath) {
          const mimeType = mime.lookup(filePath)

          switch (mimeType) {
            case 'text/xml':
            case 'image/svg':
            case 'image/svg+xml':
            case 'application/xml':
              // if image is SVG - read and store to Ceramic 'as is'
              fieldValue = await filesystem.getFileContents(filePath)
              break;
            default:
              // if image isn't SVG - upload to IPFS
              // and store CID in document's content
              // otherwise (e.g. image was removed) set CID to null
              fieldValue = await ipfs.store(filePath)
              break;
          }
        }

        content[field] = fieldValue
      }
    })

    return content
  }

  /** @private */
  _getMediaFields(schema) {
    const { mediaFields } = metadata.getFieldsNames(schema)

    return mediaFields
  }
}

module.exports = { CeramicClient, Post }
