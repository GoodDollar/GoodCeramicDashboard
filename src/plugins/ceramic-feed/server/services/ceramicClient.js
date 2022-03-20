const schema = require('../content-types/ceramic-post/schema')

module.exports = ({ strapi }) => {
  const { direct, ...config } = strapi.config.get('plugin.ceramic-feed')
  const CeramicClient = require(`./client/ceramic-${direct ? 'direct' : 'rest'}`)

  return new CeramicClient(strapi, config, schema.attributes)
};
