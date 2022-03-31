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
}
