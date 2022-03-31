module.exports = class {
  static async withArray(array, callback) {
    return Promise.all(array.map(callback))
  }

  static async withObject(object, callback) {
    return withArray(Object.keys(object), async key =>
      callback(object[key], key, object)
    )
  }
}
