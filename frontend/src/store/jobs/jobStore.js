/**
 * store/jobs/jobStore.js — Jobs Zustand Store
 *
 * Responsibilities:
 *  - Store active jobs list, single job detail, filters
 *  - Actions:
 *    * setJobs(jobs) — set full jobs list (provider feed)
 *    * addJob(job) — prepend new job from socket job:new event
 *    * setActiveJob(job) — current job being viewed/bidded
 *    * setFilters(filters) — update service/urgency/budget filters
 *    * clearJobs() — reset on unmount
 *
 * Shape:
 *  {
 *    jobs: Job[],
 *    activeJob: Job | null,
 *    filters: { service, urgency, maxBudget },
 *    setJobs, addJob, setActiveJob, setFilters, clearJobs
 *  }
 */

import { create } from 'zustand';

const useJobStore = create((set) => ({
  jobs: [],
  activeJob: null,
  filters: { service: '', urgency: '', maxBudget: null },
  setJobs: (jobs) => set({ jobs }),
  addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
  setActiveJob: (activeJob) => set({ activeJob }),
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  clearJobs: () => set({ jobs: [], activeJob: null, filters: { service: '', urgency: '', maxBudget: null } }),
}));


export default useJobStore;
