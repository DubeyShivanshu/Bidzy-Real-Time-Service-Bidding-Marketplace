/**
 * features/disputes/useDispute.js
 *
 * Responsibilities:
 *  - File dispute on bookings
 *  - Fetch user's active/historical disputes
 */

import { useState } from 'react';
import api from '@services/api.js';

export const useDispute = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const raiseDispute = async (disputeData) => {};
  const fetchDisputes = async () => {};

  return { raiseDispute, fetchDisputes, loading, error };
};

export default useDispute;
