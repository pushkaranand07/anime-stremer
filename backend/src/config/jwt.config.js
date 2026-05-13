const jwtConfig = Object.freeze({
  secret: process.env.JWT_SECRET || 'your-access-token-secret-change-this',
  expiry: process.env.JWT_EXPIRY || '15m',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret-change-this',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
});

module.exports = jwtConfig;
