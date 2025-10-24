'use strict';

const { sanitize } = require('@strapi/utils');
const { contentAPI } = sanitize;

const MODEL_UID = 'plugin::ceramic-feed.ceramic-post';

module.exports = {
  async find(ctx) {
    const entries = await strapi.entityService.findMany(MODEL_UID, {
      filters: {
        publishedAt: { $notNull: true },
      },
      sort: { publishedAt: 'desc' },
      populate: {
        picture: true,
        sponsored: true,
      },
    });

    const schema = strapi.getModel(MODEL_UID);
    const sanitized = await contentAPI.output(entries, schema, {
      auth: ctx.state.auth,
    });

    ctx.set(
      'Cache-Control',
      'public, max-age=60, s-maxage=300, stale-while-revalidate=300'
    );
    ctx.set('Vary', 'Origin');
    ctx.body = sanitized;
  },
};
