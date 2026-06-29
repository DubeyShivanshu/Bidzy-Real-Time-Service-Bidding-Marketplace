/**
 * features/providers/useProvider.js
 *
 * Responsibilities:
 *  - Profile query, update profile
 */

import { useState } from 'react';
import useProviderStore from '@store/provider/providerStore.js';
import * as providerService from '@services/providers/provider.service.js';

export const useProvider = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { profile, setProfile } = useProviderStore();

  const fetchProfile = async (providerId) => {};
  const updateProfile = async (updates) => {};

  return { profile, fetchProfile, updateProfile, loading, error };
};

export default useProvider;
