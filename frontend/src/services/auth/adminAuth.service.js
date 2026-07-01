/**
 * Admin Auth API Calls
 *
 * Responsibilities:
 *  - login(data) → POST /auth/admin/login
 *  - getMe() → GET /auth/admin/me
 *  - logout() → POST /auth/admin/logout
 */

import api from '../api.js';

export const login = (data) => api.post('/auth/admin/login', data);
export const getMe = () => api.get('/auth/admin/me');
export const logout = () => api.post('/auth/admin/logout');
