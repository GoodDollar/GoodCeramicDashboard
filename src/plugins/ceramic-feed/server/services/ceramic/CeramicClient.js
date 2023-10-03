const { assign, clone, toPairs } = require('lodash')
const { basename } = require('path')
const { URL } = require('url')
const LocalStorage = require('localstorage-memory')

const CeramicModel = require('./CeramicModel')
const { metadata, filesystem } = require('../../utils')
const { withArray } = require('../../utils/async')

global.localStorage = LocalStorage //required for orbis

class Post extends CeramicModel {
  static family = 'Post'
}

class CeramicClient {
  ipfs = null
  http = null
  mediaFields = null
  orbisSdk = null
  orbisReady = null

  constructor(strapi, httpFactory, schema, relatedSchemas) {
    const { _getMediaFields } = this
    const { relatedFieldName } = metadata

    const ipfs = strapi.service('plugin::ceramic-feed.ipfs')
    const http = httpFactory({ responseType: 'arraybuffer' })

    const mediaFields = toPairs(relatedSchemas).reduce(
      (fields, [field, relatedSchema]) => {
        const relatedMedia = _getMediaFields(relatedSchema)

        return [
          ...fields,
          relatedMedia.map(relatedField =>
            relatedFieldName(field, relatedField)
          )
        ]
      },
      _getMediaFields(schema)
    )

    http.interceptors.response.use(({ data }) => Buffer.from(data, 'binary'))

    this.orbisReady = this.initOrbis(strapi)

    assign(this, { ipfs, http, mediaFields })
  }

  async initOrbis(strapi) {
    const { config } = strapi
    const { ceramicDIDSeed, orbisContext } = config.get('plugin.ceramic-feed')
    const { Orbis } = await import('@orbisclub/orbis-sdk')

    const sdk = new Orbis()
    const connected = await sdk.connectWithSeed(ceramicDIDSeed.slice(0, 32))
    console.log('orbis connected:', connected)
    this.orbisSdk = sdk
    this.orbisContext = orbisContext
  }

  async syncOrbis(payload) {
    await this.orbisReady
    const content = await this._getContent(payload)

    const orbisFormat = this._orbisFormatContent(content)
    const { doc } = await this.orbisSdk.createPost(orbisFormat)
    return { orbisId: String(doc) }
  }

  async createAndPublish(payload) {
    await this.orbisReady
    const content = await this._getContent(payload)

    const orbisFormat = this._orbisFormatContent(content)
    const { doc } = await this.orbisSdk.createPost(orbisFormat)
    const { id } = await Post.createAndPublish(content)
    const result = { cid: String(id), orbisId: String(doc) }
    console.log('ceramic/orbis create result:', result)
    return result
  }

  async updateAndPublish(id, orbisId, payload) {
    await this.orbisReady
    const content = await this._getContent(payload)
    const document = await Post.load(id)

    const orbisFormat = this._orbisFormatContent(content)

    const result = await Promise.all([
      orbisId && this.orbisSdk.editPost(orbisId, orbisFormat),
      Post.updateAndPublish(document, content)
    ])
    console.log('ceramic/orbis update result:', result)
    return result
  }

  async unpublish(id, orbisId) {
    await this.orbisReady
    return Promise.all([
      orbisId && this.orbisSdk.deletePost(orbisId),
      Post.unpublish(id)
    ])
  }

  _orbisFormatContent(ceramicContent) {
    const { orbisContext: context } = this
    const { title, content, tags, ...data } = ceramicContent
    return {
      context,
      tags,
      title,
      body: content,
      data
    }
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
            ? // if image is SVG - read and store to Ceramic 'as is'
              filesystem.getFileContents(path)
            : // if image isn't SVG - upload to IPFS
              // and store CID in document's content
              // otherwise (e.g. image was removed) set CID to null
              ipfs.store(path)
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
