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
	  },
	  ceramic_feed_post: {
		type: "relation",
		relation: "manyToOne",
		target: "plugin::ceramic-feed.ceramic-post",
		inversedBy: "sponsor"
	  }
	}
  }