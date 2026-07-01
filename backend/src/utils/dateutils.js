/**
 * Date Utility Functions
 *
 * Responsibilities:
 *  - getJobExpiryDate() — Return Date that is JOB_EXPIRY_MINUTES from now
 *  - getElapsedMinutes(fromDate) — Minutes elapsed since a given date
 *  - formatTimestamp(date) — Human-readable timestamp string
 *
 * Used by:
 *  - Job model / controller — set expiresAt
 *  - refund.service.js — calculate elapsed time for refund policy
 */

/**
 * getJobExpiryDate — JOB_EXPIRY_MINUTES from now
 * @returns {Date}
 */
export const getJobExpiryDate = () => {
  const minutes = parseInt(process.env.JOB_EXPIRY_MINUTES || '10', 10);
  return new Date(Date.now() + minutes * 60 * 1000);
};

/**
 * getElapsedMinutes — minutes since fromDate
 * @param {Date} fromDate
 * @returns {number}
 */
export const getElapsedMinutes = (fromDate) => {
  return Math.floor((Date.now() - new Date(fromDate).getTime()) / 60000);
};

/**
 * formatTimestamp
 * @param {Date} date
 * @returns {string}
 */
export const formatTimestamp = (date) => {
  return new Date(date).toISOString();
};

export default { getJobExpiryDate, getElapsedMinutes, formatTimestamp };
