const config = require('../config');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // If not an ApiError, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false);
  }

  const response = {
    error: {
      message: error.message,
      ...(config.env === 'development' && { stack: error.stack }),
    },
  };

  // Log error
  if (error.statusCode >= 500) {
    logger.error(error);
  } else {
    logger.warn(error.message);
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorMiddleware;
