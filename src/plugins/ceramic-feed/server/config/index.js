'use strict';

module.exports = {
  default: ({ env }) => ({
    ceramicNodeURL: env('CERAMIC_NODE_URL', 'https://ceramic-clay.3boxlabs.com'),
  }),
  validator(config) {
    const mandatoryOptions = ['ceramicNodeURL', 'ceramicDIDSeed', 'pinataApiKey', 'pinataSecret']

    mandatoryOptions.forEach(option => {
      if (config[option]) {
        return
      }

      throw new Error(
        `Ceramic connection requires '${option}' option to be set.`
      )
    })
  },
};
