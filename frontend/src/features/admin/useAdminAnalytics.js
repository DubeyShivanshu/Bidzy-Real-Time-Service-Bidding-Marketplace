import { useState } from 'react';
import * as adminService from '@services/admin/admin.service.js';

export const useAdminAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState(null);

  const fetchRevenue = async (timeframe) => {};

  return { revenueData, fetchRevenue, loading, error };
};

export default useAdminAnalytics;
