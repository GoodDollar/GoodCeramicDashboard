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
        label: 'id',
        searchable: true,
        sortable: true
      }
    },
    link: {
      edit: {
        label: 'link',
        description: '',
        placeholder: '',
        visible: true,
        editable: true
      },
      list: {
        label: 'link',
        searchable: true,
        sortable: true
      }
    },
    logo: {
      edit: {
        label: 'logo',
        description: '',
        placeholder: '',
        visible: true,
        editable: true
      },
      list: {
        label: 'logo',
        searchable: false,
        sortable: false
      }
    },
    createdAt: {
      edit: {
        label: 'createdAt',
        description: '',
        placeholder: '',
        visible: false,
        editable: true
      },
      list: {
        label: 'createdAt',
        searchable: true,
        sortable: true
      }
    },
    updatedAt: {
      edit: {
        label: 'updatedAt',
        description: '',
        placeholder: '',
        visible: false,
        editable: true
      },
      list: {
        label: 'updatedAt',
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