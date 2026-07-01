/**
 * Responsibilities:
 *  - Fetch open jobs and filter jobs
 *  - Sync jobStore state with API responses
 */

import { useState } from 'react';
import useJobStore from '@store/jobs/jobStore.js';
import * as jobService from '@services/jobs/job.service.js';

export const useJobs = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { jobs, setJobs, filters, setFilters } = useJobStore();

  const fetchOpenJobs = async (searchParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await jobService.getOpenJobs(searchParams);
      setJobs(response.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch open jobs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await jobService.getMyJobs();
      setJobs(response.data.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch your jobs.');
    } finally {
      setLoading(false);
    }
  };

  return { jobs, filters, setFilters, fetchOpenJobs, fetchMyJobs, loading, error };
};

export default useJobs;
