module.exports = {
  'content-api': {
    type: 'content-api',
    routes: [
      {
        method: 'GET',
        path: '/posts',
        handler: 'posts.find',
        config: {
          auth: false,
          policies: ['plugin::ceramic-feed.origin-allowlist'],
        },
      },
    ],
  },
};
