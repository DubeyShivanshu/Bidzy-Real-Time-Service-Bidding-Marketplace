/**
 * services/auth/providerAuth.service.js — Provider Auth API Calls
 *
 * Responsibilities:
 *  - register(data) → POST /auth/provider/register
 *  - login(data) → POST /auth/provider/login
 *  - getMe() → GET /auth/provider/me
 *  - logout() → POST /auth/provider/logout
 */

import api from '../api.js';

export const register = (data) => api.post('/auth/provider/register', data);
export const login = (data) => api.post('/auth/provider/login', data);
export const getMe = () => api.get('/auth/provider/me');
export const updateProfile = (data) => api.put('/auth/provider/me', data);
export const logout = () => api.post('/auth/provider/logout');
