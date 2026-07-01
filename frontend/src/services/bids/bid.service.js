/**
 * Bid API Calls
 *
 * Responsibilities:
 *  - submitBid(data) → POST /bids
 *  - getBidsForJob(jobId) → GET /bids/job/:jobId
 *  - getMyBids() → GET /bids/provider/my
 *  - acceptBid(id) → PATCH /bids/:id/accept
 *  - rejectBid(id) → PATCH /bids/:id/reject
 */

import api from '../api.js';

export const submitBid = (data) => api.post('/bids', data);
export const getBidsForJob = (jobId) => api.get(`/bids/job/${jobId}`);
export const getMyBids = () => api.get('/bids/provider/my');
export const acceptBid = (id) => api.patch(`/bids/${id}/accept`);
export const rejectBid = (id) => api.patch(`/bids/${id}/reject`);
