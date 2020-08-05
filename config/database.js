module.exports = ({ env }) => {
  const mysql_production = {
    connector: 'bookshelf',
    settings: {
      client: 'mysql',
      host: env('DATABASE_HOST'),
      port: env('DATABASE_PORT', 5432),
      username: env('DATABASE_USERNAME'),
      password: env('DATABASE_PASSWORD'),
      database: env('DATABASE_NAME', 'strapi'),
      timezone: 'America/Guayaquil',
      ssl: false
    },
    options: {
      debug: false
    }
  };

  const mongodb_atlas = {
    connector: 'mongoose',
    settings: {
      uri: env('MONGO_URI')
    },
    options: {
      ssl: true
    }
  };

  const development = {
    connector: 'bookshelf',
    settings: {
      client: 'sqlite',
      filename: '.tmp/data.db'
    },
    options: {
      useNullAsDefault: true
    }
  };

  if (env('NODE_ENV') == 'production') {
    if (env('MONGO_URI')) {
      return {
        defaultConnection: 'default',
        connections: {
          default: mongodb_atlas
        }
      };
    }

    return {
      defaultConnection: 'default',
      connections: {
        default: mysql_production
      }
    };
  }

  return {
    defaultConnection: 'default',
    connections: {
      default: development
    }
  };
};
