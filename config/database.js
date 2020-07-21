module.exports = ({ env }) => {
  const production = {
    connector: 'mongoose',
    settings: {
      client: env("DATABASE_CLIENT", "mongo"),
      host: env("DATABASE_HOST","localhost"),
      port: env("DATABASE_PORT",27017),
      database: env("DATABASE_NAME","strapi"),
      username: env("DATABASE_USERNAME","root"),
      password: env("DATABASE_PASSWORD","dbpwd")
    },
    options: {
      authenticationDatabase: "admin",
      ssl: false,
    },
  };

  const development = {
    connector: "bookshelf",
    settings: {
      client: "sqlite",
      filename: ".tmp/data.db"
    },
    options: {
      "useNullAsDefault": true
    }
  };


  return {
    defaultConnection: 'default',
    connections: {
      default: env("NODE_ENV") == "production" ? production  : development,
    },
  }
};
