const schema = require('./schema');
const sponsorSchema = require('../sponsor/schema');

module.exports = {
  schema,
  relations: {
    sponsored: sponsorSchema
  }
}
