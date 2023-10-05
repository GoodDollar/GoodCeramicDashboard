const axios = require('axios')

const { schema, relations } = require('../content-types/ceramic-post/datagram')
const { CeramicOrbisClient } = require('./ceramic/CeramicOrbisClient')

module.exports = ({ strapi }) =>
  new CeramicOrbisClient(strapi, axios.create, schema, relations)
