/**
 * features/auth/useAdminAuth.js
 *
 * Responsibilities:
 *  - Orchestrates admin auth flows
 *  - Calls adminAuth.service.js
 *  - Updates authStore with user and token on success
 */

import { useState } from 'react';
import useAuthStore from '@store/auth/authStore.js';
import * as adminAuthService from '@services/auth/adminAuth.service.js';

export const useAdminAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  const login = async (credentials) => {};
  const logout = async () => {};

  return { login, logout, loading, error };
};

export default useAdminAuth;
