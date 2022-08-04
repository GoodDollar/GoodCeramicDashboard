const { assign, clone, toPairs } = require('lodash')
const { basename } = require('path')
const { URL } = require('url')

const CeramicModel = require('./CeramicModel')
const { metadata, filesystem } = require('../../utils')
const { withArray } = require('../../utils/async')

class Post extends CeramicModel {
  static family = 'Post'
}

class CeramicClient {
  ipfs = null
  http = null
  mediaFields = null

  constructor(strapi, httpFactory, schema, relatedSchemas) {
    const { _getMediaFields } = this
    const { relatedFieldName } = metadata

    const ipfs = strapi.service('plugin::ceramic-feed.ipfs')
    const http = httpFactory({ responseType: 'arraybuffer' })

    const mediaFields = toPairs(relatedSchemas).reduce(
      (fields, [field, relatedSchema]) => {
        const relatedMedia = _getMediaFields(relatedSchema)

        return [...fields, relatedMedia.map(
          relatedField => relatedFieldName(field, relatedField)
        )]
      },
      _getMediaFields(schema)
    )

    http.interceptors.response.use(({ data }) => Buffer.from(data, 'binary'))
    assign(this, { ipfs, http, mediaFields })
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
      if (!(field in payload)) {
        return
      }

      let fieldValue = null
      const filePath = content[field]

      // process if filePath was set
      if (filePath) {
        fieldValue = await this._withMediaFilePath(filePath, async path =>
          filesystem.isImageSVG(path)
            // if image is SVG - read and store to Ceramic 'as is'
            ? filesystem.getFileContents(path)
            // if image isn't SVG - upload to IPFS
            // and store CID in document's content
            // otherwise (e.g. image was removed) set CID to null
            : ipfs.store(path)
        )
      }

      content[field] = fieldValue
    })

    return content
  }

  /** @private */
  _getMediaFields(schema) {
    const { mediaFields } = metadata.getFieldsNames(schema)

    return mediaFields
  }

  /** @private */
  async _withMediaFilePath(urlOrPath, callback) {
    const { http } = this
    const path = urlOrPath
    let url

    try {
      url = new URL(urlOrPath)
    } catch {
      // if not url, just a local path - run callback
      return callback(path)
    }

    // if url - get file name
    const filename = basename(url.pathname)
    // download it
    const buffer = await http.get(urlOrPath)

    // write to temporary file and run callback
    return filesystem.withTemporaryFile(buffer, filename, callback)
  }
}

module.exports = { CeramicClient, Post }
