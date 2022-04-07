const schema = require('../content-types/ceramic-post/schema')
const { CeramicClient } = require('./ceramic/CeramicClient')

module.exports = ({ strapi }) => new CeramicClient(strapi, schema);
