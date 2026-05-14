/**
 * Startup Environment Validation
 * Called before anything else in server.js.
 * If any required variable is missing, the process exits immediately
 * with a clear error instead of crashing mysteriously later.
 */
function validateEnv() {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   • ${key}`));
    console.error('\nCopy .env.example to .env and fill in all required values.\n');
    process.exit(1);
  }

  // Reject known weak/default secrets (copy-paste from .env.example)
  const weakSecrets = [
    'your-super-secret-key-min-32-chars-change-this',
    'your-access-token-secret-change-this',
    'your-refresh-token-secret-change-this',
    'your-super-secret-key-min-32-chars',
    'your-refresh-secret',
    'your-refresh-secret-min-32-chars-change-this',
  ];

  if (weakSecrets.includes(process.env.JWT_SECRET)) {
    console.error('❌ JWT_SECRET is set to a known default value. Change it before running.');
    process.exit(1);
  }

  if (weakSecrets.includes(process.env.JWT_REFRESH_SECRET)) {
    console.error('❌ JWT_REFRESH_SECRET is set to a known default value. Change it before running.');
    process.exit(1);
  }
}

module.exports = validateEnv;
