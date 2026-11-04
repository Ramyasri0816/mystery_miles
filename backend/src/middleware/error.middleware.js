import logger from '../utils/logger.js';
import { apiError } from '../utils/apiResponse.js';

export const notFoundHandler = (req, res, next) => {
  apiError(res, {
    statusCode: 404,
    message: `Resource not found at ${req.method} ${req.originalUrl}`
  });
};

export const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);

  // MongoDB CastError (Invalid ObjectId)
  if (err.name === 'CastError' || (err.kind === 'ObjectId' && err.path)) {
    return apiError(res, {
      statusCode: 400,
      message: `Invalid format for resource identifier '${err.path}': '${err.value}' is not a valid ObjectId.`
    });
  }

  // MongoDB Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const keys = Object.keys(err.keyValue || {});
    const field = keys[0] || 'resource';
    const val = err.keyValue ? err.keyValue[field] : '';
    
    // Check for compound indexes (like saved trips or reviews)
    if (keys.length > 1) {
      return apiError(res, {
        statusCode: 409,
        message: `Conflict: An entry with these unique parameters already exists.`
      });
    }

    return apiError(res, {
      statusCode: 409,
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} '${val}' already exists. Please use a unique value.`
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => ({
      field: el.path,
      message: el.message
    }));
    return apiError(res, {
      statusCode: 400,
      message: 'Database schema validation failed',
      errors
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return apiError(res, {
      statusCode: 401,
      message: 'Invalid authorization token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return apiError(res, {
      statusCode: 401,
      message: 'Authorization token has expired'
    });
  }

  // Fallback internal error
  const statusCode = err.statusCode || 500;
  const message = err.isOperational
    ? err.message
    : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message);

  return apiError(res, {
    statusCode,
    message
  });
};

export default errorHandler;
