const responseHandler = require('../utils/responseHandler');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error:', err.message || err);
  if (err.stack && env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message
    }));
    return responseHandler.error(res, 'Validation failed', 'VALIDATION_ERROR', details, 400);
  }

  // Mongoose Cast Error (Invalid ObjectId)
  if (err.name === 'CastError') {
    const details = [{
      field: err.path,
      message: `Invalid format for field ${err.path}`
    }];
    return responseHandler.error(res, 'Resource not found', 'NOT_FOUND', details, 404);
  }

  // Mongoose Duplicate Key Error (MongoDB Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const details = [{
      field,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    }];
    return responseHandler.error(res, 'Conflict error', 'CONFLICT', details, 409);
  }

  // JWT Token Errors
  if (err.name === 'JsonWebTokenError') {
    return responseHandler.error(res, 'Invalid authorization token', 'UNAUTHORIZED', null, 401);
  }

  if (err.name === 'TokenExpiredError') {
    return responseHandler.error(res, 'Authorization token has expired', 'UNAUTHORIZED', null, 401);
  }

  // Default Fallback Server Error
  const message = err.message || 'An unexpected error occurred';
  const code = err.code || 'INTERNAL_ERROR';
  const status = err.status || 500;

  return responseHandler.error(res, message, code, null, status);
};

module.exports = errorHandler;
