const AsyncLock = require('async-lock')
const { assign, isEmpty, get, last } = require('lodash')
const { array, string } = require('../../utils')

class CeramicModel {
  static tile = null

  static ceramic = null

  static family = null

  static mutex = new AsyncLock()

  static async load(id) {
    const { ceramic, tile } = this

    return tile.load(ceramic, id)
  }

  /** Checks is document published (by checking the index doc) */
  static async published(id) {
    const { content } = await this.getIndex()
    const documentId = String(id)

    return get(content, 'items', []).includes(documentId)
  }

  /** Creates new Ceramic document */
  static async create(content, tags = []) {
    const { ceramic, tile } = this
    const metadata = this._createMetadata(tags)
    const newDocument = await tile.create(ceramic, content, metadata, {
      pin: true
    })

    return newDocument
  }

  /** Creates new Ceramic document and publishes in to the index */
  static async createAndPublish(content, tags = []) {
    const document = await this.create(content, tags)

    await this.publish(document)
    return document
  }

  /** Updates Ceramic document */
  static async update(document, content, tags = []) {
    const updatedContent = { ...document.content, ...content }
    const metadata = this._createMetadata(tags)

    await document.update(updatedContent, metadata)
    return document
  }

  /** Updates Ceramic document and re-publishes it to the index */
  static async updateAndPublish(document, content, tags = []) {
    // check is published
    const isPublished = await this.published(document.id)

    // update the document itself
    await this.update(document, content, tags)

    if (isPublished) {
      // if was - published - write update event to the changelog
      this.publishUpdate(document)
    } else {
      // otherwise - republish (and write added event)
      this.publish(document)
    }

    return document
  }

  /** Publishes document to the index and writes added event to the changelog */
  static async publish(document) {
    const id = String(document.id)

    await this._updateIndexes(id, 'add')
    await this._updateLiveIndexes(id, 'added')
  }

  /** Writes update event to the changelog */
  static async publishUpdate(document) {
    const id = String(document.id)

    await this._updateLiveIndexes(id, 'updated')
  }

  /** Unpublishes (removes) document form the index and writes removed event to the changelog */
  static async unpublish(id) {
    const documentId = String(id)
    const isPublished = await this.published(id)

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

    if (isEmpty(index.content)) {
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
    const indexDocument = await this.getIndex()
    const { items = [] } = indexDocument.content

    await indexDocument.update({ items: array[operation](items, String(id)) })
  }

  /** @private */
  static async _updateLiveIndexes(id, action) {
    const item = String(id)
    const { ceramic, mutex, family } = this
    const { id: publisher } = ceramic.did

    await mutex.acquire(family, async () => {
      const indexDocument = await this.getLiveIndex()
      const { items } = indexDocument.content
      const { id: lastHistoryId } = last(items) || {}

      const historyIdSource = [item, action, Date.now(), String(publisher)]

      if (lastHistoryId) {
        historyIdSource.push(lastHistoryId)
      }

      const newHistoryId = string.sha1(historyIdSource.join(''))
      const newHistoryRecord = { id: newHistoryId, action, item }
      const newHistoryPatch = {
        op: 'add',
        path: '/items/-',
        value: newHistoryRecord
      }

      await indexDocument.patch([newHistoryPatch])
    })
  }

  /** @private */
  static async _deterministic(tags) {
    const { ceramic, family, tile } = this
    const { id: controller } = ceramic.did

    return tile.deterministic(
      ceramic,
      {
        // A single controller must be provided to reference a deterministic document
        controllers: [controller],
        // A family or tag must be provided in addition to the controller
        family,
        tags
      },
      {
        pin: true
      }
    )
  }
}

module.exports = CeramicModel
