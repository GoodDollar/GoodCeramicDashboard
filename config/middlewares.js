module.exports = ({ env }) => {
  const provider = env('UPLOAD_PROVIDER', 'local')
  const limit = env.int('UPLOAD_LIMIT', 200)
  const allowedOrigins = env.array('CERAMIC_FEED_ALLOWED_ORIGINS', [
    'http://localhost:1337',
    'http://127.0.0.1:1337',
    'http://0.0.0.0:1337',
    'http://localhost:3000',
    'https://localhost:3000',
    'https://localhost:1337',
    'https://127.0.0.1:1337',
  ])
  let strapiSecurity = 'strapi::security'

  const strapiBody = {
    name: "strapi::body",
    config: {
      formLimit: "256mb", // modify form body
      jsonLimit: "256mb", // modify JSON body
      textLimit: "256mb", // modify text body
      formidable: {
        maxFileSize: limit * 1024, // multipart data, modify here limit of uploaded file size (in kB)
      },
    },
  }

  if ('aws-s3' === provider)  {
    const bucket = env('AWS_BUCKET')
    const region = env('AWS_REGION')

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
    {
      name: 'strapi::cors',
      config: {
        origin: allowedOrigins,
        headers: [
          'Content-Type',
          'Authorization',
          'Origin',
          'Accept',
          'User-Agent',
          'Referer',
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
        keepHeaderOnError: true,
      },
    },
    'strapi::poweredBy',
    'strapi::logger',
    'strapi::query',
    strapiBody,
    'strapi::session',
    'strapi::favicon',
    'strapi::public',
  ];
}
