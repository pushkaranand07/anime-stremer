require('dotenv').config();
const app = require('./app');
const connectDB = require('./database/connection');
const appConfig = require('./config/app.config');

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
