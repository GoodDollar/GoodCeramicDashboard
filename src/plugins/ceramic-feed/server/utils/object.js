const { isEmpty, omit } = require('lodash')

module.exports = class {
  static hasOnlyKeys(object, ...keys) {
    return isEmpty(omit(object, ...keys))
  }
}
