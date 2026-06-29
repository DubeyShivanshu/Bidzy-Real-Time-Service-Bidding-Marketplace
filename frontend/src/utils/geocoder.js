/**
 * utils/geocoder.js — OpenStreetMap Nominatim Reverse Geocoder
 *
 * Responsibilities:
 *  - reverseGeocode(lat, lng) — Call Nominatim API to get address from coordinates
 *  - Returns: { full, city, state, pincode, display_name }
 *  - Used in PostJob page after browser geolocation
 *
 * Note: Nominatim requires a User-Agent header with app name.
 * No API key required. Rate limit: 1 request/second.
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

/**
 * reverseGeocode — get address from coordinates
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<object>} address object
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          'User-Agent': 'Bidzy-Service-Marketplace',
        },
      }
    );
    const data = await res.json();
    if (!data || !data.address) return {};

    const addr = data.address;
    return {
      full: data.display_name || '',
      city: addr.city || addr.town || addr.village || addr.suburb || '',
      state: addr.state || '',
      pincode: addr.postcode || '',
    };
  } catch (error) {
    console.error('Nominatim reverse geocode failed:', error);
    return {};
  }
};


export default { reverseGeocode };
