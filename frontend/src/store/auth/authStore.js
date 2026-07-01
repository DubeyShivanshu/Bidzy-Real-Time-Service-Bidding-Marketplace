/**
 * Authentication Zustand Store
 *
 * Responsibilities:
 *  - Store: user object, JWT token, role, isAuthenticated flag
 *  - Actions:
 *    * setAuth(user, token) — set after successful login/register/OAuth
 *    * logout() — clear user, token, role; disconnect socket
 *    * loadFromStorage() — rehydrate auth state from localStorage on app init
 *  - Persist auth state to localStorage using zustand/middleware persist
 *
 * Shape:
 *  {
 *    user: { _id, name, email, role, city, walletBalance, verified, ... } | null,
 *    token: string | null,
 *    isAuthenticated: boolean,
 *    setAuth: (user, token) => void,
 *    logout: () => void,
 *    updateUser: (updates) => void,
 *  }
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: !!token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    { name: 'bidzy-auth' }
  )
);

export default useAuthStore;

