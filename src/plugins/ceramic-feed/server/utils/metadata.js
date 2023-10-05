const { join } = require('path')
const { get, mapValues, pick, fromPairs } = require('lodash')
const { isValidURL } = require('./string')

module.exports = class {
  static relatedFieldName = (relation, field) => `${relation}_${field}`

  static getFieldsNames(schema) {
    const { attributes } = schema
    const fields = Object.keys(attributes)

    const [mediaFields, relationFields] = ['media', 'relation'].map(type =>
      fields.filter(field => type === get(attributes, `${field}.type`))
    )

    const relations = mapValues(pick(attributes, relationFields), 'target')

    return { fields, mediaFields, relationFields, relations }
  }

  static resolveMediaFieldsPaths(entity, mediaFields) {
    const { dirs } = strapi

    // iterate over media (e.g. file upload) fields
    return mapValues(pick(entity, mediaFields), value => {
      // ignore empty value
      if (!value) {
        return null
      }

      const { url } = value

      return isValidURL(url)
        ? url // if url is valid url (e.g. link to S3) - return it "as is"
        : // in other case url is path relative to the public dir
          // so we building full path and mapping value with it
          join(dirs.static.public, url)
    })
  }

  static makePopulate(fields) {
    return fromPairs(fields.map(field => [field, true]))
  }
}
