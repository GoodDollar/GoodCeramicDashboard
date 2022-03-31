module.exports = class AsyncUtils {
  static async withArray(array, callback) {
    return Promise.all(array.map(callback))
  }

  static async withObject(object, callback) {
    return AsyncUtils.withArray(Object.keys(object), async key =>
      callback(object[key], key, object)
    )
  }
}
