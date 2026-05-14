const jwtConfig = (() => {
  const secret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required in production');
    }
  }

  return Object.freeze({
    secret: secret || 'your-access-token-secret-change-this',
    expiry: process.env.JWT_EXPIRY || '15m',
    refreshSecret: refreshSecret || 'your-refresh-token-secret-change-this',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  });
})();

module.exports = jwtConfig;
