const appConfig = Object.freeze({
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173']
});

module.exports = appConfig;
