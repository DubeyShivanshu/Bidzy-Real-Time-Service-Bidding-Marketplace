/**
 * Responsibilities:
 *  - Orchestrates customer authentication flows
 *  - Calls customerAuth.service.js
 *  - Updates authStore with user and token on success
 */

import { useState } from 'react';
import useAuthStore from '@store/auth/authStore.js';
import * as customerAuthService from '@services/auth/customerAuth.service.js';

export const useCustomerAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  const login = async (credentials) => {};
  const register = async (userData) => {};
  const logout = async () => {};

  return { login, register, logout, loading, error };
};

export default useCustomerAuth;
