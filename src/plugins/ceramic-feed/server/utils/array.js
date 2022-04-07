module.exports = class {
  static add(array, item) {
    return [ ...array, item ]
  }

  static remove(array, item) {
    return array.filter(arrayItem => arrayItem !== item)
  }
}
