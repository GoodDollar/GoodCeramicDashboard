module.exports = {
  uid: 'plugin::ceramic-feed.ceramic-post',
  settings: {
    bulkable: true,
    filterable: true,
    searchable: true,
    pageSize: 10,
    mainField: 'title',
    defaultSortBy: 'title',
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
    title: {
      edit: {
        label: 'title',
        description: '',
        placeholder: '',
        visible: true,
        editable: true
      },
      list: {
        label: 'title',
        searchable: true,
        sortable: true
      }
    },
    content: {
      edit: {
        label: 'content',
        description: '',
        placeholder: '',
        visible: true,
        editable: true
      },
      list: {
        label: 'content',
        searchable: false,
        sortable: false
      }
    },
    picture: {
      edit: {
        label: 'picture',
        description: '',
        placeholder: '',
        visible: true,
        editable: true
      },
      list: {
        label: 'picture',
        searchable: false,
        sortable: false
      }
    },
    cid: {
      edit: {
        label: 'cid',
        description: '',
        placeholder: '',
        visible: true,
        editable: false
      },
      list: {
        label: 'cid',
        searchable: true,
        sortable: true
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
        name: 'title',
        size: 8
      }, {
        name: 'cid',
        size: 4
      }],
      [{
        name: 'picture',
        size: 12
      }],
      [{
        name: 'content',
        size: 12
      }]
    ],
    editRelations: [],
    list: ['id', 'title', 'picture', 'cid']
  }
}