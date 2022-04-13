module.exports = {
  uid: 'plugin::ceramic-feed.sponsor',
  settings: {
    bulkable: true,
    filterable: true,
    searchable: true,
    pageSize: 10,
    mainField: 'link',
    defaultSortBy: 'link',
    defaultSortOrder: 'ASC'
  },
  metadatas: {
    id: {
      edit: {},
      list: {
        label: 'ID',
        searchable: true,
        sortable: true
      }
    },
    link: {
      edit: {
        label: 'URL',
        description: 'Sponsor\'s site or social page url',
        placeholder: '',
        visible: true,
        editable: true
      },
      list: {
        label: 'URL',
        searchable: true,
        sortable: true
      }
    },
    logo: {
      edit: {
        label: 'Logo image',
        description: 'Sponsor\'s logo image. Pick .SVG files only!',
        placeholder: '',
        visible: true,
        editable: true
      },
      list: {
        label: 'Logo image',
        searchable: false,
        sortable: false
      }
    },
    createdAt: {
      edit: {
        label: 'Created At',
        description: '',
        placeholder: '',
        visible: false,
        editable: true
      },
      list: {
        label: 'Created At',
        searchable: true,
        sortable: true
      }
    },
    updatedAt: {
      edit: {
        label: 'Updated At',
        description: '',
        placeholder: '',
        visible: false,
        editable: true
      },
      list: {
        label: 'Updated At',
        searchable: true,
        sortable: true
      }
    }
  },
  layouts: {
    edit: [
      [{
        name: 'logo',
        size: 12
      }],
      [{
        name: 'link',
        size: 12
      }]
    ],
    editRelations: [],
    list: ['id', 'link', 'logo', 'createdAt']
  }
}