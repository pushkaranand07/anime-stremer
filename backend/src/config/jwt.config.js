// jwt.config.js — Zero tolerance for missing secrets.
// validateEnv() in server.js guarantees these exist by the time this runs.

const jwtConfig = Object.freeze({
  secret: process.env.JWT_SECRET,
  expiry: process.env.JWT_EXPIRY || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
});

module.exports = jwtConfig;
