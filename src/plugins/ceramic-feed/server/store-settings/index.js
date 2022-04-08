const { keyBy, mapValues } = require('lodash')
const _export = modules => mapValues(keyBy(modules, 'key'), 'settings')

module.exports = _export([

  require('./ceramic-post'),
  require('./sponsor'),

])
