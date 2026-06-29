/**
 * utils/response.js — Standardized API Response Helpers
 *
 * Responsibilities:
 *  - successResponse(res, data, message, statusCode) — Send 200/201 success envelope
 *  - errorResponse(res, message, statusCode) — Send error envelope
 *  - paginatedResponse(res, data, page, limit, total) — Send paginated list envelope
 *
 * All responses follow the shape:
 *  { success: boolean, message: string, data?: any, pagination?: object }
 */

/**
 * successResponse
 */
export const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

/**
 * errorResponse
 */
export const errorResponse = (res, message = 'Error', statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message });
};

/**
 * paginatedResponse
 */
export const paginatedResponse = (res, data, page, limit, total) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export default { successResponse, errorResponse, paginatedResponse };
