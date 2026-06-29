/**
 * services/providers/provider.service.js — Provider API Calls
 *
 * Responsibilities:
 *  - getProviderProfile(id) → GET /providers/:id
 *  - updateProfile(data) → PATCH /providers/profile
 *  - submitVerification(formData) → POST /providers/verification (multipart)
 *  - getVerificationStatus() → GET /providers/verification/status
 */

import api from '../api.js';

export const getProviderProfile = (id) => api.get(`/providers/${id}`);
export const updateProfile = (data) => api.patch('/providers/profile', data);
export const submitVerification = (formData) =>
  api.post('/providers/verification', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getVerificationStatus = () => api.get('/providers/verification/status');
