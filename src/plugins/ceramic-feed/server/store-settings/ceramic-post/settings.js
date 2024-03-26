module.exports = {
  uid: 'plugin::ceramic-feed.ceramic-post',
  settings: {
    bulkable: true,
    filterable: true,
    searchable: true,
    pageSize: 10,
    mainField: 'title',
    defaultSortBy: 'id',
    defaultSortOrder: 'DESC'
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
    title: {
      edit: {
        label: 'Post title',
        description: 'Your post title',
        placeholder: '',
        visible: true,
        editable: true
      },
      list: {
        label: 'Post title',
        searchable: true,
        sortable: true
      }
    },
    content: {
      edit: {
        label: 'Post content',
        description: 'A short brief you want to share',
        placeholder: '',
        visible: true,
        editable: true
      },
      list: {
        label: 'Post content',
        searchable: false,
        sortable: false
      }
    },
    picture: {
      edit: {
        label: 'Landing picture',
        description: "A picture above the post's title (optional)",
        placeholder: '',
        visible: true,
        editable: true
      },
      list: {
        label: 'Landing picture',
        searchable: false,
        sortable: false
      }
    },
    publishWallet: {
      edit: {
        label: 'Publish to wallet',
        visible: true,
        editable: true
      },
      list: {
        label: 'Publish to wallet',
        searchable: true,
        sortable: true
      }
    },
    publishWalletV2: {
      edit: {
        label: 'Publish to GoodWalletV2',
        visible: true,
        editable: true
      },
      list: {
        label: 'Publish to GoodWalletV2',
        searchable: true,
        sortable: true
      }
    },
    publishDapp: {
      edit: {
        label: 'Publish to GoodDapp',
        visible: true,
        editable: true
      },
      list: {
        label: 'GoodDapp',
        searchable: true,
        sortable: true
      }
    },
    sponsored: {
      edit: {
        label: 'Sponsored by',
        description: 'A sponsor logo with the link in the footer (optional)',
        placeholder: '',
        visible: true,
        editable: true,
        mainField: 'link'
      },
      list: {
        label: 'sponsored',
        searchable: true,
        sortable: true
      }
    },
    link: {
      edit: {
        label: 'URL',
        description: 'A link to the full article',
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
    orbisId: {
      edit: {
        label: 'orbisId',
        description: 'Orbis document id',
        placeholder: '',
        visible: true,
        editable: false
      },
      list: {
        label: 'orbisId',
        searchable: true,
        sortable: true
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
      [
        {
          name: 'title',
          size: 12
        },
        {
          name: 'link',
          size: 12
        }
      ],
      [
        {
          name: 'picture',
          size: 12
        }
      ],
      [
        {
          name: 'content',
          size: 12
        }
      ],
      [
        {
          name: 'publishWallet',
          size: 12
        }
      ],
      [
        {
          name: 'publishWalletV2',
          size: 12
        }
      ],
      [
        {
          name: 'publishDapp',
          size: 12
        }
      ],
      [
        {
          name: 'sponsored',
          size: 12
        }
      ],
      [
        {
          name: 'cid',
          size: 12
        }
      ],
      [
        {
          name: 'orbisId',
          size: 12
        }
      ]
    ],
    list: ['id', 'title', 'link', 'picture']
  }
}
