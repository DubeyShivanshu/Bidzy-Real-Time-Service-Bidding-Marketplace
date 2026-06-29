/**
 * store/admin/adminStore.js — Admin Zustand Store
 *
 * Shape:
 *  {
 *    metrics: DashboardMetrics | null,
 *    users: User[],
 *    providers: Provider[],
 *    disputes: Dispute[],
 *    setMetrics, setUsers, setProviders, setDisputes,
 *    updateUser, updateProvider, updateDispute
 *  }
 */

import { create } from 'zustand';

const useAdminStore = create((set) => ({
  metrics: null,
  users: [],
  providers: [],
  disputes: [],
  setMetrics: (metrics) => {},
  setUsers: (users) => {},
  setProviders: (providers) => {},
  setDisputes: (disputes) => {},
  updateUser: (userId, updates) => {},
  updateProvider: (providerId, updates) => {},
  updateDispute: (disputeId, updates) => {},
}));

export default useAdminStore;
