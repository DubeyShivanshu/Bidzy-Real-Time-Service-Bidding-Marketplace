/**
 * store/provider/providerStore.js — Provider Zustand Store
 *
 * Shape:
 *  {
 *    profile: ProviderProfile | null,
 *    verificationStatus: 'none' | 'pending' | 'approved' | 'rejected',
 *    nearbyJobs: Job[],
 *    setProfile, setVerificationStatus, setNearbyJobs, addNearbyJob
 *  }
 */

import { create } from 'zustand';

const useProviderStore = create((set) => ({
  profile: null,
  verificationStatus: 'none',
  nearbyJobs: [],
  setProfile: (profile) => {},
  setVerificationStatus: (status) => {},
  setNearbyJobs: (jobs) => {},
  addNearbyJob: (job) => {},
}));

export default useProviderStore;
