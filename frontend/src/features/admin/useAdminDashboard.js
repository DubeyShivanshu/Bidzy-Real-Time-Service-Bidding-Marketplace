/**
 * features/admin/useAdminDashboard.js
 *
 * Responsibilities:
 *  - Admin dashboard live metrics fetcher
 */

import { useState } from 'react';
import useAdminStore from '@store/admin/adminStore.js';
import * as adminService from '@services/admin/admin.service.js';

export const useAdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { metrics, setMetrics } = useAdminStore();

  const fetchMetrics = async () => {};

  return { metrics, fetchMetrics, loading, error };
};

export default useAdminDashboard;
