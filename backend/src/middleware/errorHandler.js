/**
 * middleware/errorHandler.js — Global Express Error Handler
 *
 * Responsibilities:
 *  - Catches all errors passed via next(err)
 *  - Formats consistent JSON error responses
 *  - Handles Mongoose validation errors (400)
 *  - Handles Mongoose duplicate key errors (409)
 *  - Handles JWT errors (401)
 *  - Falls back to 500 for unknown errors
 *  - Hides stack traces in production
 */

export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error caught in middleware:', {
    message: err.message,
    statusCode: err.statusCode,
    error: err,
    stack: err.stack
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
