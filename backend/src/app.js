const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const responseHandler = require('./utils/responseHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const routes = require('./routes');

const app = express();

// Security Headers
app.use(helmet());

// CORS config
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Morgan HTTP request logging (only logs if not in test)
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Response compression
app.use(compression());

// Base rate limiting on API routes
app.use('/api', apiLimiter);

// Root health check endpoint
app.get('/health', (req, res) => {
  return responseHandler.success(res, 'Server is healthy', {
    uptime: process.uptime(),
    status: 'UP',
    timestamp: new Date()
  });
});

// API Routes aggregator entry
app.use('/api/v1', routes);

// Fallback 404 Route
app.use((req, res, next) => {
  const err = new Error(`Cannot ${req.method} ${req.originalUrl}`);
  err.status = 404;
  err.code = 'NOT_FOUND';
  next(err);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
