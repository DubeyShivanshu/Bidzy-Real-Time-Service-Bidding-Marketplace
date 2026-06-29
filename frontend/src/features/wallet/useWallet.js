/**
 * features/wallet/useWallet.js
 *
 * Responsibilities:
 *  - Balance retrieval
 *  - Paginated transaction history queries
 */

import { useState } from 'react';
import useWalletStore from '@store/wallet/walletStore.js';
import * as walletService from '@services/wallet/wallet.service.js';

export const useWallet = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { balance, transactions, setBalance, setTransactions } = useWalletStore();

  const fetchWalletDetails = async () => {};
  const fetchTransactions = async (page) => {};

  return { balance, transactions, fetchWalletDetails, fetchTransactions, loading, error };
};

export default useWallet;
