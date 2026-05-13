const ApiError = require('../utils/ApiError');
const appConfig = require('../config/app.config');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Log error for debugging
  logger.error(`${req.method} ${req.url} - ${err.message}`, { stack: err.stack });

  if (!(err instanceof ApiError)) {
    statusCode = err.statusCode || 500;
    message = err.message || 'Internal Server Error';
  }

  const response = {
    success: false,
    statusCode,
    message,
    ...(appConfig.isDev ? { stack: err.stack } : {}),
    errors: err.errors || [],
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
