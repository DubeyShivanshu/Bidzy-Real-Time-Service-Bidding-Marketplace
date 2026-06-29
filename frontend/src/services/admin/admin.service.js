/**
 * services/admin/admin.service.js — Admin API Calls
 *
 * Responsibilities:
 *  - getDashboardMetrics() → GET /admin/dashboard
 *  - getAllUsers(params) → GET /admin/users
 *  - getUserById(id) → GET /admin/users/:id
 *  - suspendUser(id) → PATCH /admin/users/:id/suspend
 *  - activateUser(id) → PATCH /admin/users/:id/activate
 *  - getAllProviders(params) → GET /admin/providers
 *  - verifyProvider(id) → PATCH /admin/providers/:id/verify
 *  - rejectProvider(id, note) → PATCH /admin/providers/:id/reject
 *  - getAllBookings(params) → GET /admin/bookings
 *  - getBookingById(id) → GET /admin/bookings/:id
 *  - getAllDisputes(params) → GET /admin/disputes
 *  - resolveDispute(id, data) → PATCH /admin/disputes/:id/resolve
 *  - getBookingChat(bookingId) → GET /admin/disputes/chat/:bookingId
 *  - getRevenueAnalytics(params) → GET /admin/analytics/revenue
 */

import api from '../api.js';

export const getDashboardMetrics = () => api.get('/admin/dashboard');
export const getAllUsers = (params) => api.get('/admin/users', { params });
export const getUserById = (id) => api.get(`/admin/users/${id}`);
export const suspendUser = (id) => api.patch(`/admin/users/${id}/suspend`);
export const activateUser = (id) => api.patch(`/admin/users/${id}/activate`);
export const getAllProviders = (params) => api.get('/admin/providers', { params });
export const getProviderById = (id) => api.get(`/admin/providers/${id}`);
export const verifyProvider = (id) => api.patch(`/admin/providers/${id}/verify`);
export const rejectProvider = (id, data) => api.patch(`/admin/providers/${id}/reject`, data);
export const getAllBookings = (params) => api.get('/admin/bookings', { params });
export const getBookingById = (id) => api.get(`/admin/bookings/${id}`);
export const getAllDisputes = (params) => api.get('/admin/disputes', { params });
export const getAdminDisputeById = (id) => api.get(`/admin/disputes/${id}`);
export const resolveDispute = (id, data) => api.patch(`/admin/disputes/${id}/resolve`, data);
export const getBookingChat = (bookingId) => api.get(`/admin/disputes/chat/${bookingId}`);
export const getRevenueAnalytics = (params) => api.get('/admin/analytics/revenue', { params });
export const getPlatformOverview = () => api.get('/admin/analytics/overview');
