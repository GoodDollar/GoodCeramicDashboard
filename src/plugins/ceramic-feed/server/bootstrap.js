'use strict';

module.exports = async ({ strapi }) => {
  const VIEW_SETTINGS_KEY = 'plugin_content_manager_configuration_content_types::plugin::ceramic-feed.ceramic-post'

  const VIEW_SETTINGS = {
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
      sponsored_link: {
        edit: {
          label: 'Sponsored Logo',
          description: '',
          placeholder: '',
          visible: true,
          editable: true
        },
        list: {
          label: 'Sponsored Logo',
          searchable: true,
          sortable: true
        }
      },
      sponsored_logo: {
        edit: {
          label: 'Sponsored Logo',
          description: '',
          placeholder: '',
          visible: true,
          editable: true
        },
        list: {
          label: 'Sponsored Logo',
          searchable: true,
          sortable: true
        }
      },
      link: {
        edit: {
          label: 'Link',
          description: '',
          placeholder: '',
          visible: true,
          editable: true
        },
        list: {
          label: 'Link',
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
          name: 'link',
          size: 8
        },
				{
					name: 'sponsored_link',
					size: 8
				},
				{
					name: 'sponsored_logo',
					size: 8
				},
				{
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
      list: ['id', 'title', 'sponsored_link', 'sponsored_logo', 'link', 'picture', 'cid']
    }
  }

  // bootstrap phase
  await strapi.db.query('strapi::core-store').update({
    where: { key: VIEW_SETTINGS_KEY },
    data: { value: JSON.stringify(VIEW_SETTINGS) },
  })
};
