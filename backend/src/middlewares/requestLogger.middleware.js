const morgan = require('morgan');
const logger = require('../utils/logger');

const stream = {
  write: (message) => logger.http(message.trim()),
};

// Only skip logging for health-check endpoints to reduce noise
// Never skip in all non-development environments
const skip = (req) => {
  return req.url === '/api/v1/health';
};

const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  { stream, skip }
);

module.exports = requestLogger;
