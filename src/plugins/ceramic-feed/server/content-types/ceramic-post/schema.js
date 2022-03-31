module.exports = {
  info: {
    tableName: 'ceramic-post',
    singularName: 'ceramic-post',
    pluralName: 'ceramic-posts',
    displayName: 'Ceramic feed post',
    description: 'Live articles piblished to the ceramic network stream',
    kind: 'collectionType',
  },
  options: {
    draftAndPublish: true
  },
  pluginOptions: {
    'content-type-builder': {
      visible: false,
    }
  },
  attributes: {
    title: {
      type: 'string',
      required: true,
      configurable: false,
    },
    content: {
      type: 'richtext',
      required: true,
      configurable: false,
    },
    picture: {
      type: 'media',
      multiple: false,
      required: true,
      configurable: false,
      allowedTypes: [
        'images'
      ]
    },
    cid: {
      type: 'string',
      private: true,
      unique: true,
      configurable: false,
    }
  }
}