module.exports = ({ env }) => {
  console.log({ NODE_ENV: env('NODE_ENV') });
  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    admin: {
      auth: {
        secret: env('ADMIN_JWT_SECRET')
      }
    },
    cron: {
      enabled: true
    }
  };
};
