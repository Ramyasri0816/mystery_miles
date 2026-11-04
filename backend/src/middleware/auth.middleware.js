import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/User.model.js';
import { apiError } from '../utils/apiResponse.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // 1. Read token from HTTP-only cookie or Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return apiError(res, {
        statusCode: 401,
        message: 'Authentication required. Please log in to access this resource.'
      });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 3. Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return apiError(res, {
        statusCode: 401,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return apiError(res, {
        statusCode: 401,
        message: 'Invalid authentication token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return apiError(res, {
        statusCode: 401,
        message: 'Authentication token has expired. Please log in again.'
      });
    }
    return apiError(res, {
      statusCode: 500,
      message: 'Authentication check failed.'
    });
  }
};

/**
 * Role-based authorization middleware
 * @param  {...string} roles
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return apiError(res, {
        statusCode: 403,
        message: 'Access denied: You do not have permission to perform this action.'
      });
    }
    next();
  };
};

/**
 * Optional authentication middleware: attaches user if token is valid, but does not block if not
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Ignore invalid token on optional auth
  }
  next();
};

export default authenticateToken;
