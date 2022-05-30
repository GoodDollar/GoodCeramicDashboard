const { URL } = require('url')
const { createHash } = require('crypto')
const { memoize, template, isPlainObject } = require('lodash')

module.exports = class {
  /** @private */
  static _templateFactory = memoize(tmplString =>
    template(tmplString, { interpolate: /{(\S+?)}/g })
  )

  static mustache(tmplString, variables = null) {
    const templateFn = this._templateFactory(tmplString)

    return isPlainObject(variables) ? templateFn(variables) : templateFn
  }

  static isValidURL(string) {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  static sha1(string) {
    const hash = createHash('sha1')

    return hash.update(string).digest('hex')
  }
}
