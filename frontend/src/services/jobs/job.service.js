/**
 * Job API Calls
 *
 * Responsibilities:
 *  - createJob(data) → POST /jobs
 *  - getOpenJobs(params) → GET /jobs
 *  - getMyJobs() → GET /jobs/customer/my
 *  - getJobById(id) → GET /jobs/:id
 *  - cancelJob(id) → DELETE /jobs/:id
 */

import api from '../api.js';

export const createJob = (data) => api.post('/jobs', data);
export const getOpenJobs = (params) => api.get('/jobs', { params });
export const getMyJobs = () => api.get('/jobs/customer/my');
export const getJobById = (id) => api.get(`/jobs/${id}`);
export const cancelJob = (id) => api.delete(`/jobs/${id}`);
