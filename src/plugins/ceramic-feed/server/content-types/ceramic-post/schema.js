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
    draftAndPublish: false
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
      required: false,
      configurable: false,
      allowedTypes: [
        'images'
      ]
    },
    sponsored_link: {
			type: 'string',
      required: false,
      configurable: false,
		},
    sponsored_logo: {
			type: 'string',
      required: false,
      configurable: false,
		},
    link: {
			type: 'string',
      required: true,
      configurable: false,
		},
    cid: {
      type: 'string',
      private: true,
      unique: true,
      configurable: false,
    }
  }
}