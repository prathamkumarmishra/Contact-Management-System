/**
 * Unified API Response Formatter
 */

const success = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const error = (res, message, code = 'INTERNAL_ERROR', details = null, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details
    }
  });
};

module.exports = {
  success,
  error
};
