module.exports = {
	'collectionName': 'components_ceramic_post_sponsors',
	'info': {
	  'displayName': 'ceramic-post-sponsor',
	  'singularName': 'ceramic-post-sponsor',
	  'pluralName': 'ceramic-post-sponsor',
	  'icon': 'hand-holding-usd',
	  'description': ''
	},
	'options': {},
	'attributes': {
	  'Link': {
		'type': 'string'
	  },
	  'Logo': {
		'type': 'media',
		'multiple': true,
		'required': true,
		'allowedTypes': [
		  'images'
		]
	  }
	}
  }
  