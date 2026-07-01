/**
 * Responsibilities:
 *  - Request browser geolocation permission
 *  - Return { lat, lng, error, loading, requestLocation }
 *  - Used in PostJob.jsx to get user's coordinates
 *  - Feeds into Leaflet map and Nominatim reverse geocoding
 */

import { useState, useCallback } from 'react';

const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to get geolocation');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  return { coords, error, loading, requestLocation };
};


export default useGeolocation;
