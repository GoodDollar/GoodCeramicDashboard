const axios = require('axios')

const { schema, relations } = require('../content-types/ceramic-post/datagram')
const { CeramicClient } = require('./ceramic/CeramicClient')

module.exports = ({ strapi }) => new CeramicClient(strapi, axios.create, schema, relations);
