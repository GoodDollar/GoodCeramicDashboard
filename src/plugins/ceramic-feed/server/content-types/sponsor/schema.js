module.exports = {
	collectionName: "components_ceramic_post_sponsors",
	info: {
	  displayName: "sponsor",
	  singularName: "sponsor",
	  pluralName: "sponsor",
	  icon: "hand-holding-usd",
	  description: ""
	},
	options: {},
	attributes: {
	  Link: {
		type: "string"
	  },
	  Logo: {
		type: "media",
		multiple: true,
		required: false,
		allowedTypes: [
		  "images"
		]
	  }
	}
  }