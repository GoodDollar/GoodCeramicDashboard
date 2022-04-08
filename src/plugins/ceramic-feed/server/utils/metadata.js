const { join } = require('path');
const { get, mapValues, pick } = require('lodash')

module.exports = class {
  static getFieldsNames(schema) {
    const { attributes } = schema
    const fields = Object.keys(attributes)

    const mediaFields = fields.filter(field =>
      'media' === get(attributes, `${field}.type`)
    )

    return { fields, mediaFields }
  }

  static resolveMediaFieldsPaths(entity, mediaFields) {
    const { dirs } = strapi

    // iterate over media (e.g. file upload) fields
    return mapValues(pick(entity, mediaFields), value => {
      // its value is object having 'url' prop
      const { url } = value

      // url is path relative to the public dir
      // building full path and mapping value with it
      return join(dirs.public, url)
    })
  }
};
