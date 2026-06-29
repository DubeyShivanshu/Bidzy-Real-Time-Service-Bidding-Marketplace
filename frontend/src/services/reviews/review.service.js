/**
 * services/reviews/review.service.js — Review API Service
 *
 * Axios connectors to review endpoints:
 *  POST /api/reviews                          — submitReview
 *  GET  /api/reviews/provider/:providerId     — getProviderReviews (public)
 *  GET  /api/reviews/booking/:bookingId       — getBookingReview (auth)
 */

import api from '../api.js';

export const submitReview = (payload) =>
  api.post('/reviews', payload);

export const getProviderReviews = (providerId, params = {}) =>
  api.get(`/reviews/provider/${providerId}`, { params });

export const getBookingReview = (bookingId) =>
  api.get(`/reviews/booking/${bookingId}`);

export default { submitReview, getProviderReviews, getBookingReview };
