/**
 * Rate Limiting Configuration
 *
 * Responsibilities:
 *  - Prevent brute force attacks on auth endpoints
 *  - Apply stricter limits on login/register routes
 *  - Apply general API limits on all routes
 *  - Uses express-rate-limit
 */

import rateLimit from 'express-rate-limit';

/**
 * authLimiter — strict limit for auth routes
 * 10 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * apiLimiter — general limit for API routes
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

export default { authLimiter, apiLimiter };
