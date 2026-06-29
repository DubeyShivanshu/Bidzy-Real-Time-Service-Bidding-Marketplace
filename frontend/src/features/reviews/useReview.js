/**
 * features/reviews/useReview.js
 *
 * Responsibilities:
 *  - Submit reviews for bookings
 *  - Fetch review list for specific provider
 */

import { useState } from 'react';
import api from '@services/api.js';

export const useReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitReview = async (reviewData) => {};
  const fetchReviews = async (providerId) => {};

  return { submitReview, fetchReviews, loading, error };
};

export default useReview;
