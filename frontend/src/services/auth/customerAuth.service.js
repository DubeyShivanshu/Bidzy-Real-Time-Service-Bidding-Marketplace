/**
 * services/auth/customerAuth.service.js — Customer Auth API Calls
 *
 * Responsibilities:
 *  - register(data) → POST /auth/customer/register
 *  - login(data) → POST /auth/customer/login
 *  - getMe() → GET /auth/customer/me
 *  - logout() → POST /auth/customer/logout
 */

import api from '../api.js';

export const register = (data) => api.post('/auth/customer/register', data);
export const login = (data) => api.post('/auth/customer/login', data);
export const getMe = () => api.get('/auth/customer/me');
export const updateProfile = (data) => api.put('/auth/customer/me', data);
export const logout = () => api.post('/auth/customer/logout');
