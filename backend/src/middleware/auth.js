/**
 * middleware/auth.js — JWT Authentication Middleware
 *
 * Responsibilities:
 *  - Extract Bearer token from Authorization header
 *  - Verify token using JWT_SECRET
 *  - Attach decoded user payload to req.user
 *  - Return 401 if token missing or invalid
 *  - Used on all protected routes
 */

import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';


export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = verifyToken(token);

      // Get user from the token, exclude password
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return errorResponse(res, 'Not authorized, user not found', 401);
      }

      if (req.user.isSuspended) {
        return errorResponse(res, 'Account is suspended', 403);
      }

      return next();
    } catch (error) {
      console.error(error);
      return errorResponse(res, 'Not authorized, token failed', 401);
    }
  }

  if (!token) {
    return errorResponse(res, 'Not authorized, no token', 401);
  }
};

export default protect;

