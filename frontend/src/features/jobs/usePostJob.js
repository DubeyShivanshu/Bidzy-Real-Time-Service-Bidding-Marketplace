/**
 * features/jobs/usePostJob.js
 *
 * Responsibilities:
 *  - Orchestrates job creation (PostJob page)
 *  - Submits to job.service.js → createJob
 */

import { useState } from 'react';
import * as jobService from '@services/jobs/job.service.js';

export const usePostJob = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const postJob = async (jobData) => {};

  return { postJob, loading, error };
};

export default usePostJob;
