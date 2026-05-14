const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const appConfig = require('./config/app.config');
const routes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler.middleware');
const requestLogger = require('./middlewares/requestLogger.middleware');
const { mongoSanitize } = require('./middlewares/sanitize.middleware');

const app = express();

// Logging
app.use(requestLogger);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // Disable for dev to allow various stream sources
}));
app.use(cors({
  origin: appConfig.allowedOrigins,
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// API Routes
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
