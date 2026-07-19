const rateLimit = require('express-rate-limit');
const responseHandler = require('../utils/responseHandler');

const limiter = (maxRequests, windowMs, message) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    handler: (req, res) => {
      return responseHandler.error(
        res,
        message || 'Too many requests, please try again later',
        'RATE_LIMITED',
        null,
        429
      );
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  authLimiter: limiter(isProduction ? 5 : 100, 15 * 60 * 1000, 'Too many login attempts, please try again after 15 minutes'),
  apiLimiter: limiter(100, 15 * 60 * 1000, 'Too many requests, rate limit exceeded (100 req / 15 min)'),
  searchLimiter: limiter(60, 60 * 1000, 'Search rate limit exceeded (60 req / 1 min)')
};
