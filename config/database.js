const path = require('path');

module.exports = ({ env }) => {
  const client = env('DATABASE_CLIENT', 'sqlite')

  const options = {
    postgres: {},
    sqlite: {
      useNullAsDefault: true,
    },
  }

  const connectionOptions = {
    sqlite: {
      filename: path.join(__dirname, '..', env('DATABASE_FILENAME', 'var/db.sqlite3')),
    },
    postgres: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME'),
      user: env('DATABASE_USERNAME'),
      password: env('DATABASE_PASSWORD'),
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
