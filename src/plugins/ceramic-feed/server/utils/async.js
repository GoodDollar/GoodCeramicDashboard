const { toPairs, pick, assign } = require('lodash')

module.exports = class AsyncUtils {
  static async withArray(array, callback) {
    return Promise.all(array.map(callback))
  }

  static async withObject(object, callback) {
    return AsyncUtils.withArray(Object.keys(object), async key =>
      callback(object[key], key, object)
    )
  }

  static async import(modules) {
    const imported = await AsyncUtils.withArray(toPairs(modules), async ([name, module]) =>
      import(module).then(module => pick(module, name))
    )

    return assign(...imported)
  }
}
