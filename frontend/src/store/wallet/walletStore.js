/**
 * Wallet Zustand Store
 *
 * State:
 *  - walletBalance: number
 *  - transactions: Transaction[]
 *  - pagination: { page, limit, total, pages }
 *
 * Actions:
 *  - setBalance, incrementBalance (for optimistic UI updates)
 *  - setTransactions, addTransaction (prepend latest to top)
 */

import { create } from 'zustand';

const useWalletStore = create((set, get) => ({
  walletBalance: 0,
  transactions: [],
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  loading: false,
  error: null,

  setBalance: (walletBalance) => set({ walletBalance }),

  incrementBalance: (amount) =>
    set((state) => ({ walletBalance: state.walletBalance + amount })),

  setTransactions: (transactions, pagination = {}) =>
    set({ transactions, pagination: { ...get().pagination, ...pagination } }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  clearWallet: () =>
    set({ walletBalance: 0, transactions: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }),
}));

export default useWalletStore;
