const path = require('path');
const { URL } = require('url');
const { trimStart } = require('lodash');

module.exports = ({ env }) => {
  const databaseUrl = env('DATABASE_URL')
  const { protocol, username, password, host, port, pathname } = databaseUrl ? new URL(databaseUrl) : {}
  const client = env('DATABASE_CLIENT', protocol || 'sqlite')

  const options = {
    postgres: {},
    sqlite: {
      useNullAsDefault: true,
    },
  }

  const connectionOptions = {
    sqlite: {
      filename: path.join(__dirname, '..', env('DATABASE_FILENAME', pathname || 'var/db.sqlite3')),
    },
    postgres: {
      host: env('DATABASE_HOST', host || '127.0.0.1'),
      port: env.int('DATABASE_PORT', port ? parseInt(port) : 5432),
      database: env('DATABASE_NAME', trimStart(pathname, '/')),
      user: env('DATABASE_USERNAME', username),
      password: env('DATABASE_PASSWORD', password),
      ssl: {
        // For self-signed certificates
        rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false),
      },
    }
  }

  return {
    connection: {
      client,
      connection: connectionOptions[client],
      ...options[client]
    },
  }
};
