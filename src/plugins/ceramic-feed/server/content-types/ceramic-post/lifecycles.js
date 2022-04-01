const { join } = require('path');
const { assign, pick, map, filter, mapValues } = require('lodash');

const { metadata, array } = require('../../utils')
const schema = require('./schema');

const LifecycleHooks = new class {
  get ceramic() {
    const { strapi } = this

    return strapi.service('plugin::ceramic-feed.ceramicClient')
  }

  get posts() {
    const { db } = this.strapi

    return db.query('plugin::ceramic-feed.ceramic-post')
  }

  constructor(strapi, schema) {
    let { fields, mediaFields } = metadata.getFieldsNames(schema)
    fields = array.remove(fields, 'cid')

    assign(this, { strapi, fields, mediaFields })
  }

  async onPublish({ result }) {
    const { ceramic, posts } = this
    const { cid, publishedAt } = result

    // on publish we have to pre-fill
    // or update 'published' date field
    const payload = {
      ...this._readPayload(result),
      published: publishedAt
    }

    // if Ceramic ID was set - update doc (with latest data)
    // and publish (by writing 'updated' event to the changelog)
    if (cid) {
      await ceramic.updateAndPublish(cid, payload)
      return
    }

    // if no Ceramic ID in document - create document
    // and write 'added' event to the changelog
    const document = await ceramic.createAndPublish(payload)
    const data = { cid: String(document.id) }
    const where = pick(result, 'id')

    // prefill result with Ceramic ID newly generated
    assign(result, data)
    // update post record with Ceramic IDs
    await posts.update({ where, data })
  }

  async onUpdate(event) {
    const { ceramic } = this
    const { params, result } = event
    const { publishedAt, cid } = result
    const { data, where } = params

    // id update payload have 'cid' field - this
    // is the update query from onPublish()
    // The Ceramic ID field isn't editable so
    // there's no other way to update id
    if (('cid' in data) && ('id' in where)) {
      // if setting ceramic id on first publish - do nothing
      return
    }

    // if 'publishedAt' present in update PAYLOAD - publish or unpublish
    // button was pressed, there's no other cases where this field
    // could be presented in payload
    if ('publishedAt' in data) {
      // if publishedAt is set - publishing document
      if (data.publishedAt) {
        return this.onPublish(event)
      }

      // if publishedAt is null - unpublishing it
      return this.onUnpublish(event)
    }

    // if 'publishedAt' present in DOCUMENT (but absent in UPDATE PAYLOAD) that means
    // the published document was updated and nees to be also updated in Ceramic
    // before update we're checking is Ceramic ID is set
    if (publishedAt && cid) {
      const payload = this._readPayload(result)

      await ceramic.updateAndPublish(cid, payload)
    }

    // if no 'publishedAt' present in DOCUMENT then means the DRAFT was updated we're skipping
    // updating of the drafts in Ceramic. they will be updated on the next re-publish
  }

  async onUnpublish({ result, params }) {
    const { ceramic } = this

    // afterDelete triggers once also at bulk remove
    // with specific where condition we could check for
    if ('$and' in params.where) {
      // skip on bulk remove
      return
    }

    // if non-bulk remove - getting ceramic
    // ID and unpublishing document
    const { cid } = result

    // do not try to remove the document wasn't published
    if (cid) {
      await ceramic.unpublish(cid)
    }
  }

  async onUnpublishMany({ params }) {
    const { ceramic, posts } = this
    const { where } = params

    const ids = await posts
      .findMany({ select: ['cid'], where })
      .then(records => map(records, 'cid'))

    await Promise.all(filter(ids), async id => ceramic.unpublish(id))
  }

  /**
   * @private
   * Reads payload and picks uploaded files paths up
   */
  _readPayload(result) {
    const { fields, mediaFields, strapi } = this
    const { dirs } = strapi

    // iterate over fiels
    return mapValues(pick(result, fields), (value, field) => {
      // if field is media (e.g. file upload)
      if (mediaFields.includes(field)) {
        // its value is object having 'url' prop
        const { url } = value

        // url is path relative to the public dir
        // building full path and mapping value with it
        return join(dirs.public, url)
      }

      // non-media fields are mapped with own raw values
      return value
    })
  }
}(strapi, schema)

module.exports = {
  async afterUpdate(event) {
    return LifecycleHooks.onUpdate(event)
  },

  // we still need to listen for delete events
  // because physical removal should also unpublish
  // documents from Ceramic Network
  async afterDelete(event) {
    return LifecycleHooks.onUnpublish(event)
  },

  async beforeDeleteMany(event) {
    return LifecycleHooks.onUnpublishMany(event)
  }
}
