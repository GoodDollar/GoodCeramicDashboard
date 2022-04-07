module.exports = {
	'kind': 'collectionType',
	'info': {
	  'tableName': 'ceramic-post',
	  'singularName': 'ceramic-post',
	  'pluralName': 'ceramic-posts',
	  'displayName': 'Ceramic feed post',
	  'description': 'Live articles piblished to the ceramic network stream',
	  'kind': 'collectionType'
	},
	'options': {
	  'draftAndPublish': false
	},
	'pluginOptions': {
	  'content-type-builder': {
		'visible': true
	  }
	},
	'attributes': {
	  'title': {
		'type': 'string',
		'required': true,
		'configurable': false
	  },
	  'content': {
		'type': 'richtext',
		'required': true,
		'configurable': false
	  },
	  'picture': {
		'type': 'media',
		'multiple': false,
		'required': false,
		'configurable': false,
		'allowedTypes': [
		  'images'
		]
	  },
	  'link': {
		'type': 'string',
		'required': true,
		'configurable': false
	  },
	  'cid': {
		'type': 'string',
		'private': true,
		'unique': true,
		'configurable': false
	  },
	  'sponsor': {
		'type': 'component',
		'repeatable': true,
		'component': 'ceramic-post.sponsor'
	  }
	}
  }
  