module.exports = class {
  static getFieldsNames(schema) {
    const { attributes } = schema
    const fields = Object.keys(attributes)

    const mediaFields = fields.filter(field =>
      'media' === get(attributes, `${field}.type`)
    )

    return { fields, mediaFields }
  }
};
