/**
 * Responsibilities:
 *  - Orchestrates provider bid submission
 *  - API submit + socket emit
 */

import { useState } from 'react';
import * as bidService from '@services/bids/bid.service.js';
import useSocket from '@hooks/useSocket.js';

export const useBidSubmit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const socket = useSocket();

  const submitBid = async (jobId, bidData) => {};

  return { submitBid, loading, error };
};

export default useBidSubmit;
