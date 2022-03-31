const { assign, isEmpty, get } = require('lodash')
const { array } = require('../../utils')

const { TileDocument } = require('@ceramicnetwork/stream-tile')

class CeramicModel {
  static ceramic = null;

  static family = null;

  static async load(id) {
    return TileDocument.load(this.ceramic, id)
  }

  static async published(id) {
    const { content } = await this.getIndex()
    const documentId = String(id)

    return get(content, 'items', []).includes(documentId)
  }

  static async create(content, tags = []) {
    const metadata = this._createMetadata(tags)
    const newDocument = await TileDocument.create(this.ceramic, content, metadata)

    return newDocument
  }

  static async createAndPublish(content, tags = []) {
    const document = await this.create(content, tags)

    await this.publish(document)
    return document
  }

  static async update(document, content, tags = []) {
    const updatedContent = { ...document.content, ...content }
    const metadata = this._createMetadata(tags)

    await document.update(updatedContent, metadata)
    return document
  }

  static async updateAndPublish(document, content, tags = []) {
    const isPublished = await this.published(document.id)

    await this.update(document, content, tags)

    if (isPublished) {
      this.publishUpdate(document)
    } else {
      this.publish(document)
    }

    return document
  }

  static async publish(document) {
    const id = String(document.id)

    await this._updateIndexes(id, 'add')
    await this._updateLiveIndexes(id, 'added')
  }

  static async publishUpdate(document) {
    const id = String(document.id)

    await this._updateLiveIndexes(id, 'updated')
  }

  static async unpublish(id) {
    const documentId = String(id)
    const isPublished = await this.ensureExists(id)

    if (!isPublished) {
      return
    }

    await this._updateIndexes(documentId, 'remove')
    await this._updateLiveIndexes(documentId, 'removed')
  }

  static async getIndex() {
    return this._getIndexDocument()
  }

  static async getLiveIndex() {
    return this._getIndexDocument(true)
  }

  /** @private */
  static async _getIndexDocument(forLiveIndex = false) {
    const tagName = `${forLiveIndex ? 'live-' : ''}indexes`
    const index = await this._deterministic([tagName])

    if (isEmpty(index.content) && !forLiveIndex) {
      await index.update({ items: [] })
    }

    return index
  }

  /** @private */
  static _createMetadata(tags = []) {
    const { family } = this
    const metadata = { family }

    if (!isEmpty(tags)) {
      assign(metadata, { tags })
    }

    return metadata
  }

  /** @private */
  static async _updateIndexes(id, operation) {
    const indexDocument = await this.getIndex();
    const { items = [] } = indexDocument.content

    await indexDocument.update({ items: array[operation](items, String(id)) })
  }

  /** @private */
  static async _updateLiveIndexes(id, action) {
    const indexDocument = await this.getLiveIndex();

    await indexDocument.update({ action, item: String(id) })
  }

  /** @private */
  static async _deterministic(tags) {
    const { ceramic, family } = this
    const { id: controller } = ceramic.did

    return TileDocument.deterministic(ceramic, {
      // A single controller must be provided to reference a deterministic document
      controllers: [controller],
      // A family or tag must be provided in addition to the controller
      family,
      tags
    })
  }
}

module.exports = CeramicModel;
