const path = require('path');
const { URL } = require('url');
const { trimStart, trimEnd } = require('lodash');

const parseDatabaseUrl = env => {
  const databaseUrl = env('DATABASE_URL')

  if (!databaseUrl) {
    return {}
  }

  const { protocol, username, password, hostname, port, pathname } = new URL(databaseUrl)

  const options = {
    client: trimEnd(protocol, ':'),
    host: hostname,
    database: trimStart(pathname, '/'),
    username,
    password
  }

  if (port) {
    options.port = parseInt(port)
  }

  return options
}

const getSQLiteOptions = (env, { database }) => {
  const databaseName = env('DATABASE_FILENAME', database || 'var/db.sqlite3')

  return {
    useNullAsDefault: true,
    connection: {
      filename:  path.join(__dirname, '..', databaseName)
    }
  }
}

const getPostgreSQLOptions = (env, databaseUrlOptions) => {
  const { host, port, database, username, password } = databaseUrlOptions

  return {
    connection: {
      host: env('DATABASE_HOST', host || '127.0.0.1'),
      port: env.int('DATABASE_PORT', port || 5432),
      database: env('DATABASE_NAME', database),
      user: env('DATABASE_USERNAME', username),
      password: env('DATABASE_PASSWORD', password),
      ssl: {
        // For self-signed certificates
        rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false),
      }
    }
  }
}

const getDatabaseOptions = (client, env, databaseUrlOptions) => {
  let optionsFactory = () => ({})
  const factories = { sqlite: getSQLiteOptions, postgres: getPostgreSQLOptions }

  if (client in factories) {
    optionsFactory = factories[client]
  }

  return optionsFactory(env, databaseUrlOptions)
}

module.exports = ({ env }) => {
  const databaseUrlOptions = parseDatabaseUrl(env)
  const client = env('DATABASE_CLIENT', databaseUrlOptions.client || 'sqlite')
  const options = getDatabaseOptions(client, env, databaseUrlOptions)

  return { connection: { client, ...options } }
};
