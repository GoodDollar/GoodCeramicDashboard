module.exports = {
  info: {
    tableName: 'sponsor',
    singularName: 'sponsor',
    pluralName: 'sponsors',
    displayName: 'Sponsors',
    description: 'Sponsored tagging of the live articles',
    kind: 'collectionType',
  },
  options: {
    draftAndPublish: false
  },
  pluginOptions: {
    'content-type-builder': {
      visible: false,
    }
  },
  attributes: {
    link: {
      type: 'string',
      required: true,
      configurable: false,
    },
    logo: {
      type: 'media',
      multiple: false,
      required: true,
      configurable: false,
      allowedTypes: [
        'images'
      ]
    }
  }
}