import React, { useState, useEffect } from 'react';
import * as walletService from '../../services/wallet/wallet.service.js';
import useAuthStore from '../../store/auth/authStore.js';
import Spinner from '../../components/common/Spinner.jsx';
import toast from 'react-hot-toast';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Banknote, ShieldCheck } from 'lucide-react';

const TRANSACTION_TYPE_STYLES = {
  credit: { label: 'Credit', color: 'text-green-600', bg: 'bg-green-50', icon: ArrowUpCircle },
  debit: { label: 'Debit', color: 'text-red-600', bg: 'bg-red-50', icon: ArrowDownCircle },
  refund: { label: 'Refund', color: 'text-blue-600', bg: 'bg-blue-50', icon: ArrowUpCircle },
  commission: { label: 'Platform Commission', color: 'text-purple-600', bg: 'bg-purple-50', icon: ArrowDownCircle },
  deposit_return: { label: 'Deposit Returned', color: 'text-teal-600', bg: 'bg-teal-50', icon: ArrowUpCircle },
};

export const AdminWallet = () => {
  const { user, updateUser } = useAuthStore();
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    setLoading(true);
    try {
      const [walletRes, txRes] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions({ page: 1, limit: 100 }),
      ]);
      setWalletBalance(walletRes.data.data.walletBalance);
      updateUser({ walletBalance: walletRes.data.data.walletBalance });
      setTransactions(txRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load wallet data.');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = () => {
    toast('Withdrawal functionality will be available soon!', { icon: '🚧' });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Platform Revenue</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            Track platform fees and commissions collected from completed bookings.
          </p>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 -mr-6 -mt-6 rounded-full bg-white opacity-5"></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-white/10 rounded-xl border border-white/10">
            <Wallet className="h-6 w-6 text-green-400" />
          </div>
          <span className="text-sm font-bold tracking-wider uppercase text-gray-400">
            Total Revenue (Admin Wallet)
          </span>
        </div>
        <p className="text-5xl font-black tracking-tight text-white">
          ₹{walletBalance.toLocaleString('en-IN')}
        </p>
        
        <div className="mt-8">
          <button
            onClick={handleWithdraw}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl text-sm transition hover:bg-green-700 shadow-sm flex items-center gap-2"
          >
            <Banknote className="h-4 w-4" /> Withdraw to Company Bank
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Commission History</h2>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Wallet className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No platform revenue yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const style = TRANSACTION_TYPE_STYLES[tx.type] || TRANSACTION_TYPE_STYLES.credit;
              const Icon = style.icon;
              const isPositive = ['credit', 'refund', 'deposit_return', 'commission'].includes(tx.type);

              return (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-full ${style.bg}`}>
                      <Icon className={`h-5 w-5 ${style.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{style.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-sm truncate font-medium">
                        {tx.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 font-bold">
                      Bal: ₹{tx.balance.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWallet;
