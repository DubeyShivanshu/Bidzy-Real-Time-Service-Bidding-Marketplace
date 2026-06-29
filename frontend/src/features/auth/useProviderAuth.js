/**
 * features/auth/useProviderAuth.js
 *
 * Responsibilities:
 *  - Orchestrates provider auth flows
 *  - Calls providerAuth.service.js
 *  - Updates authStore with user and token on success
 */

import { useState } from 'react';
import useAuthStore from '@store/auth/authStore.js';
import * as providerAuthService from '@services/auth/providerAuth.service.js';

export const useProviderAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  const login = async (credentials) => {};
  const register = async (userData) => {};
  const logout = async () => {};

  return { login, register, logout, loading, error };
};

export default useProviderAuth;
