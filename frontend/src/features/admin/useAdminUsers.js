/**
 * features/admin/useAdminUsers.js
 *
 * Responsibilities:
 *  - Admin user management hooks
 */

import { useState } from 'react';
import useAdminStore from '@store/admin/adminStore.js';
import * as adminService from '@services/admin/admin.service.js';

export const useAdminUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { users, setUsers, updateUser } = useAdminStore();

  const fetchUsers = async (filters) => {};
  const suspendUserAccount = async (userId) => {};
  const activateUserAccount = async (userId) => {};

  return { users, fetchUsers, suspendUserAccount, activateUserAccount, loading, error };
};

export default useAdminUsers;
