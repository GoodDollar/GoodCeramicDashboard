const { join } = require('path');
const { get, mapValues, pick } = require('lodash')

module.exports = class {
  static getFieldsNames(schema) {
    const { attributes } = schema
    const fields = Object.keys(attributes)

    const [mediaFields, relationFields] = ['media', 'relation']
      .map(type => fields.filter(field =>
        type === get(attributes, `${field}.type`)
      ))

    const relations = mapValues(pick(attributes, relationFields), 'target')

    return { fields, mediaFields, relationFields, relations }
  }

  static resolveMediaFieldsPaths(entity, mediaFields) {
    const { dirs } = strapi

    // iterate over media (e.g. file upload) fields
    return mapValues(pick(entity, mediaFields), value => {
      // url is path relative to the public dir
      // building full path and mapping value with it
	  if (value?.url) {
        return join(dirs.public, value?.url)
	  }
    })
  }

  static relatedFieldName(relation, field) {
	return `${relation}_${field}`
  }
};
