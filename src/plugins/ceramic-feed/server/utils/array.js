module.exports = class {
  static add(array, ...items) {
    return [ ...array, ...items ]
  }

  static remove(array, ...items) {
    return array.filter(arrayItem => !items.includes(arrayItem))
  }
}
