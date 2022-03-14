module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '0849301b875696615560044ac7536a31'),
  },
});
