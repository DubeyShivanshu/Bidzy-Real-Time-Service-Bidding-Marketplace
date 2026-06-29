/**
 * features/providers/useVerification.js
 *
 * Responsibilities:
 *  - KYCDocument submit
 *  - Fetch verification status
 */

import { useState } from 'react';
import useProviderStore from '@store/provider/providerStore.js';
import * as providerService from '@services/providers/provider.service.js';

export const useVerification = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { verificationStatus, setVerificationStatus } = useProviderStore();

  const submitKYC = async (formData) => {};
  const fetchStatus = async () => {};

  return { verificationStatus, submitKYC, fetchStatus, loading, error };
};

export default useVerification;
