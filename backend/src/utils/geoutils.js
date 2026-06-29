/**
 * utils/geoutils.js — Geographic Utility Functions
 *
 * Responsibilities:
 *  - buildGeoQuery(lat, lng, radiusKm) — Build MongoDB $near geo query for job feeds
 *  - calculateDistance(coord1, coord2) — Haversine formula distance between two points
 *
 * Used by:
 *  - job.controller.js — getOpenJobs to filter jobs near provider
 *  - Provider dashboard — display distance to job
 */

/**
 * buildGeoQuery — MongoDB $near query builder
 * @param {number} lng
 * @param {number} lat
 * @param {number} radiusKm — search radius in kilometers
 * @returns {object} Mongoose geo query
 */
export const buildGeoQuery = (lng, lat, radiusKm = 50) => {
  // TODO: Return { $near: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: radiusKm * 1000 } }
  return {};
};

/**
 * calculateDistance — Haversine formula
 * @param {[number, number]} coord1 — [lng, lat]
 * @param {[number, number]} coord2 — [lng, lat]
 * @returns {number} distance in kilometers
 */
export const calculateDistance = (coord1, coord2) => {
  // TODO: Haversine implementation
  return 0;
};

export default { buildGeoQuery, calculateDistance };
