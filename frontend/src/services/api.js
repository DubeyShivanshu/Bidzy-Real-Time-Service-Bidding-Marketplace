/**
 * services/api.js — Axios Instance with Interceptors
 *
 * Responsibilities:
 *  - Create configured Axios instance with VITE_API_BASE_URL
 *  - Request interceptor: attach JWT token from authStore to Authorization header
 *  - Response interceptor: handle 401 (token expired → logout), normalize errors
 *  - Export as default for all service files
 */

import axios from 'axios';

import useAuthStore from '@store/auth/authStore.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000, // Increased to 60s for large image uploads
});

// Request interceptor — attach token from authStore
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 auto-logout, extract error message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      useAuthStore.getState().logout();
      // Only redirect if not already on the login page to avoid loops
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

