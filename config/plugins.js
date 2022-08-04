const providerFactories = {
  local: env => ({
    sizeLimit: env.int('UPLOAD_SIZE_LIMIT', 100000),
    localServer: {
      maxage: env.int('UPLOAD_MAXAGE', 300000)
    },
  }),
  'aws-s3': env => ({
    accessKeyId: env('AWS_ACCESS_KEY_ID'),
    secretAccessKey: env('AWS_ACCESS_SECRET'),
    region: env('AWS_REGION'),
    params: {
      Bucket: env('AWS_BUCKET'),
    },
  })
}

const getProviderOptions = (provider, env) => {
  let providerFactory = () => ({})

  if (provider in providerFactories) {
    providerFactory = providerFactories[provider]
  }

  return providerFactory(env)
}

module.exports = ({ env }) => {
  const provider = env('UPLOAD_PROVIDER', 'local')
  const providerOptions = getProviderOptions(provider, env)

  return {
    upload: {
      config: {
        provider,
        providerOptions
      }
    },
    'ceramic-feed': {
      enabled: true,
      resolve: './src/plugins/ceramic-feed',
      config: {
        web3storageGateway: env('WEB3STORAGE_GATEWAY', 'https://ipfsgateway.goodworker.workers.dev'),
        ceramicNodeURL: env('CERAMIC_NODE_URL', 'https://ceramic-clay.3boxlabs.com'),
        ceramicDIDSeed: env('CERAMIC_DID_SEED'),
      },
    },
  }
}
