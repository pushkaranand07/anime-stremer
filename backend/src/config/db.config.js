const dbConfig = Object.freeze({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/anime-streamer',
  options: {
    // Mongoose connection options
    autoIndex: true,
  }
});

module.exports = dbConfig;
