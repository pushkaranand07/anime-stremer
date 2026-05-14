require('dotenv').config(); // Load env FIRST — before any other require
const validateEnv = require('./startup/validateEnv');
validateEnv(); // Fail fast if env is broken

const app = require('./app');
const connectDB = require('./database/connection');
const appConfig = require('./config/app.config');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    await connectDB();

    app.listen(appConfig.port, () => {
      logger.info(`🚀 Server running at http://localhost:${appConfig.port}/api/v1 [${appConfig.nodeEnv}]`);
    });
  } catch (error) {
    logger.error('❌ Server failed to start', { message: error.message, stack: error.stack });
    process.exit(1);
  }
};

startServer();
