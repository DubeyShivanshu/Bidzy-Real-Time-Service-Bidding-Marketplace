/**
 * Dispute API Calls
 */

import api from '../api.js';

export const raiseDispute = (data) => api.post('/disputes', data);
export const getMyDisputes = (params) => api.get('/disputes/my', { params });
export const getDisputeById = (id) => api.get(`/disputes/${id}`);
export const getDisputeByBookingId = (bookingId) => api.get(`/disputes/booking/${bookingId}`);
