/**
 * middleware/role.js — Role-Based Access Control Middleware
 *
 * Responsibilities:
 *  - Factory function that returns a middleware for a given set of allowed roles
 *  - Must be used AFTER protect middleware (req.user must be populated)
 *  - Returns 403 Forbidden if user's role is not in the allowed list
 *
 * Usage:
 *  router.get('/admin-only', protect, authorize('admin'), controller)
 *  router.post('/customer-action', protect, authorize('customer'), controller)
 *  router.get('/shared', protect, authorize('customer', 'provider'), controller)
 */

import { errorResponse } from '../utils/response.js';

/**
 * authorize — role guard factory
 * @param {...string} roles — allowed role strings
 * @returns {import('express').RequestHandler}
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return errorResponse(res, `Forbidden: access restricted to roles: [${roles.join(', ')}]`, 403);
    }
    next();
  };
};

export default authorize;

