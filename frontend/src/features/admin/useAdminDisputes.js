/**
 * Responsibilities:
 *  - Admin dispute queue query + resolve
 */

import { useState } from 'react';
import useAdminStore from '@store/admin/adminStore.js';
import * as adminService from '@services/admin/admin.service.js';

export const useAdminDisputes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { disputes, setDisputes, updateDispute } = useAdminStore();

  const fetchDisputes = async () => {};
  const resolvePlatformDispute = async (disputeId, data) => {};

  return { disputes, fetchDisputes, resolvePlatformDispute, loading, error };
};

export default useAdminDisputes;
