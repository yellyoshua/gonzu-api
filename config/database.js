module.exports = ({ env }) => {
  const production = {
    connector: "mongoose",
    settings: {
      client: "mongo",
      host: env("DATABASE_HOST"),
      port: env("DATABASE_PORT"),
      database: env("DATABASE_NAME"),
      username: env("DATABASE_USERNAME"),
      password: env("DATABASE_PASSWORD"),
    },
    options: {
      authenticationDatabase: "admin",
      ssl: false,
    },
  };

  const production_atlas = {
    connector: "mongoose",
    settings: {
      uri: env("MONGO_URI"),
    },
    options: {
      ssl: true,
    },
  };

  const development = {
    connector: "bookshelf",
    settings: {
      client: "sqlite",
      filename: ".tmp/data.db",
    },
    options: {
      useNullAsDefault: true,
    },
  };

  if (env("NODE_ENV") == "production") {
    if (env("MONGO_URI") !== "") {
      return {
        defaultConnection: "default",
        connections: {
          default: production_atlas,
        },
      };
    }

    return {
      defaultConnection: "default",
      connections: {
        default: production,
      },
    };
  }

  return {
    defaultConnection: "default",
    connections: {
      default: development,
    },
  };
};
