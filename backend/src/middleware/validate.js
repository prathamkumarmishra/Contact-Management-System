const { validationResult } = require('express-validator');
const responseHandler = require('../utils/responseHandler');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const details = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    return responseHandler.error(
      res,
      'Validation failed',
      'VALIDATION_ERROR',
      details,
      400
    );
  }
  
  next();
};

module.exports = validate;
