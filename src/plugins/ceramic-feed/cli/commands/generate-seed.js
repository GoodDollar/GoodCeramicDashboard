const colors = require('chalk')
const crypto = require('crypto')

const logger = require('../utils/logger')

try {
  const seed = crypto.randomBytes(32).toString("hex");
  const dotEnvLine = `CERAMIC_DID_SEED="${seed}"`

  logger.action('generated').succeeded(`${seed}\n`);
  logger.info('Add the following line to Your .env file:');
  logger.info(`${colors.cyan(dotEnvLine)}\n`);
} catch (exception) {
  logger.error(exception);
}
