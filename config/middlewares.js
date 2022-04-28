module.exports = ({ env }) => {
  const bucket = env('AWS_BUCKET')
  const region = env('AWS_REGION')
  const provider = env('UPLOAD_PROVIDER', 'local')
  let strapiSecurity = 'strapi::security'

  if ('aws-s3' === provider)  {
    const allowedSource = [
      `https://${bucket}.s3.amazonaws.com`,
      `https://${bucket}.s3.${region}.amazonaws.com`
    ]
    
    strapiSecurity = {
      name: strapiSecurity,
      config: {
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            'connect-src': ["'self'", 'https:'],
            'img-src': ["'self'", 'data:', 'blob:', ...allowedSource],
            'media-src': ["'self'", 'data:', 'blob:', ...allowedSource],
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
