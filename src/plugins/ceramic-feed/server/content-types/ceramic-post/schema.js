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
      visible: true,
    }
  },
  attributes: {
    title: {
      type: 'string',
      required: true,
      configurable: false,
    },
    link: {
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
    sponsored: {
      type: 'relation',
      relation: 'manyToOne',
      target: 'plugin::ceramic-feed.sponsor',
      required: false,
      configurable: false,
    },
    // reference to the ceramic document ID
    // once doc physically created it kept in Ceramic forever
    // to publish/unpublish we're updating index doc
    cid: {
      type: 'string',
      private: true,
      unique: true,
      configurable: false,
    }
  }
}