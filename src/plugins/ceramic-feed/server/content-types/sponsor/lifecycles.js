const { ApplicationError } = require('@strapi/utils').errors;
const { assign } = require('lodash')

const { filesystem } = require('../../utils')

const LifecycleHooks = new class {
  get assets() {
    const { db } = this.strapi

    return db.query('plugin::upload.file')
  }

  constructor(strapi) {
    assign(this, { strapi })
  }

  async validatePayload({ params }) {
    const { assets } = this
    const { logo } = params.data

    if (!logo) {
      return
    }

    const { url } = await assets.findOne({
      select: ['url'],
      where: { id: logo }
    })

    if (!filesystem.isImageSVG(url)) {
      throw new ApplicationError('Logo image should be an .SVG image!')
    }
  }
}(strapi)

module.exports = {
  async beforeCreate(event) {
    return LifecycleHooks.validatePayload(event)
  },

  async beforeUpdate(event) {
    return LifecycleHooks.validatePayload(event)
  },
}
