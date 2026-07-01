/**
 * Responsibilities:
 *  - Leaflet map orchestration for PostJob (customer coordinates selection)
 *  - Coordinates to address Nominatim service linkage
 */

import { useState } from 'react';
import { reverseGeocode } from '@utils/geocoder.js';

export const useJobMap = () => {
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMarkerDragEnd = async (lat, lng) => {
    setLoading(true);
    try {
      const addr = await reverseGeocode(lat, lng);
      setAddress(addr);
      return addr;
    } catch (error) {
      console.error('Failed to resolve marker location:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { address, handleMarkerDragEnd, loading, setAddress };
};


export default useJobMap;
