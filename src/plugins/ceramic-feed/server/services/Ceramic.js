const { schema, relations } = require('../content-types/ceramic-post/datagram')
const { CeramicClient } = require('./ceramic/CeramicClient')

module.exports = ({ strapi }) => new CeramicClient(strapi, schema, relations);
