/**
 * Responsibilities:
 *  - Initialize Razorpay Order via backend api
 *  - Load Razorpay SDK and open dialog
 *  - Verify payment on success
 */

import { useState } from 'react';
import * as walletService from '@services/wallet/wallet.service.js';

export const useRazorpay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiateTopUp = async (amount) => {};

  return { initiateTopUp, loading, error };
};

export default useRazorpay;
