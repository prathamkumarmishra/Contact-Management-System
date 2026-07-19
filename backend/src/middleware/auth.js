const tokenUtils = require('../utils/tokenUtils');
const responseHandler = require('../utils/responseHandler');

const protect = async (req, res, next) => {
  let token;

  // Read token from Authorization Header: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return responseHandler.error(
      res,
      'Access denied, missing authorization token',
      'UNAUTHORIZED',
      null,
      401
    );
  }

  try {
    // Verify Access Token
    const decoded = tokenUtils.verifyAccessToken(token);

    // Attach user payload details to the request object
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    // TokenExpiredError or JsonWebTokenError handled by global error handler,
    // but we can catch and route specifically here for consistent responses.
    if (error.name === 'TokenExpiredError') {
      return responseHandler.error(
        res,
        'Authorization access token has expired',
        'UNAUTHORIZED',
        null,
        401
      );
    }
    
    return responseHandler.error(
      res,
      'Invalid authorization token credentials',
      'UNAUTHORIZED',
      null,
      401
    );
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return responseHandler.error(
        res,
        `User role (${req.user?.role || 'none'}) is not authorized to access this resource`,
        'FORBIDDEN',
        null,
        403
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
