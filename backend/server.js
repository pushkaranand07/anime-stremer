require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/database/connection');
const appConfig = require('./src/config/app.config');

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Start Listening
    app.listen(appConfig.port, () => {
      console.log(`
🚀 Server is running!
📡 Mode: ${appConfig.nodeEnv}
🔗 URL: http://localhost:${appConfig.port}/api/v1
      `);
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
    process.exit(1);
  }
};

startServer();
