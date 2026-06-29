/**
 * utils/formatters.js — Formatting Utility Functions
 *
 * Responsibilities:
 *  - formatCurrency(amount) — Format as Indian Rupees: ₹1,000
 *  - formatDate(date) — Human-readable date: "Jun 22, 2026"
 *  - formatTimeAgo(date) — Relative time: "2 hours ago"
 *  - formatDistance(km) — "1.2 km away"
 *  - formatRating(rating) — "4.5 ⭐"
 */

/**
 * formatCurrency — Indian Rupee format
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

/**
 * formatDate
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(date));

/**
 * formatTimeAgo — relative time
 * @param {string|Date} date
 * @returns {string}
 */
export const formatTimeAgo = (date) => {
  // TODO: Implement relative time calculation
  return '';
};

/**
 * formatDistance
 * @param {number} km
 * @returns {string}
 */
export const formatDistance = (km) => {
  if (km < 1) return `${Math.round(km * 1000)}m away`;
  return `${km.toFixed(1)} km away`;
};

export default { formatCurrency, formatDate, formatTimeAgo, formatDistance };
