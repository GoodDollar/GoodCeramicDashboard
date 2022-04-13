module.exports = ({ env }) => {
  const bucket = env('AWS_BUCKET')
  const provider = env('UPLOAD_PROVIDER', 'local')
  let strapiSecurity = 'strapi::security'

  if ('aws-s3' === provider)  {
    strapiSecurity = {
      name: strapiSecurity,
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': ["'self'", 'data:', 'blob:', `https://${bucket}.s3.amazonaws.com`],
            'media-src': ["'self'", 'data:', 'blob:', `https://${bucket}.s3.amazonaws.com`],
            upgradeInsecureRequests: null,
          },
        },
      },
    }
  }

  return [
    'strapi::errors',
    strapiSecurity,
    'strapi::cors',
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    'strapi::body',
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
}
