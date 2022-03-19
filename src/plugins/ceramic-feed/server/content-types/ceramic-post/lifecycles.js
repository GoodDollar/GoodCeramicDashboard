const CERAMIC_CLIENT = 'plugin::ceramic-feed.ceramicClient'

module.exports = {
  async beforeCreate({ model, params }) {
    const { data } = params
    const ceramic = strapi.service(CERAMIC_CLIENT)
    const { id } = await ceramic.create(data)

    data.cid = id
    console.log(model)
  },

  async afterUpdate({ model, params }) {
    const ceramic = strapi.service(CERAMIC_CLIENT)
    const { data, where } = params

    console.log(model)
    await ceramic.update(where.id, data)
  },

  async afterDelete({ params }) {
    const ceramic = strapi.service(CERAMIC_CLIENT)

    await ceramic.delete(params.where.id)
  },
}
