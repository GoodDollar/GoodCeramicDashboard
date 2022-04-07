const settings = require('../store-settings')
const { withObject } = require('../utils/async')

module.exports = async db => {
  // set store settings
  await withObject(settings, async (settings, key) => db
    .query('strapi::core-store').update({
      where: { key },
      data: { value: JSON.stringify(settings) },
    })
  )
}
