import React, { useState, useEffect } from 'react';
import * as walletService from '../../services/wallet/wallet.service.js';
import useWalletStore from '../../store/wallet/walletStore.js';
import useAuthStore from '../../store/auth/authStore.js';
import Spinner from '../../components/common/Spinner.jsx';
import toast from 'react-hot-toast';
import { Wallet, ArrowUpCircle, ArrowDownCircle, PlusCircle, IndianRupee } from 'lucide-react';

const TRANSACTION_TYPE_STYLES = {
  credit: { label: 'Credit', color: 'text-green-600', bg: 'bg-green-50', icon: ArrowUpCircle },
  debit: { label: 'Debit', color: 'text-red-600', bg: 'bg-red-50', icon: ArrowDownCircle },
  refund: { label: 'Refund', color: 'text-blue-600', bg: 'bg-blue-50', icon: ArrowUpCircle },
  commission: { label: 'Commission', color: 'text-purple-600', bg: 'bg-purple-50', icon: ArrowDownCircle },
  deposit_return: { label: 'Deposit Returned', color: 'text-teal-600', bg: 'bg-teal-50', icon: ArrowUpCircle },
};

// Pre-load Razorpay script on mount so checkout opens instantly
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const CustomerWallet = () => {
  const { walletBalance, transactions, setBalance, setTransactions, pagination } =
    useWalletStore();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [topping, setTopping] = useState(false);

  useEffect(() => {
    fetchWalletData();
    loadRazorpayScript(); // pre-warm in background
  }, []);

  const fetchWalletData = async () => {
    setLoadingWallet(true);
    try {
      const [walletRes, txRes] = await Promise.all([
        walletService.getWallet(),
        walletService.getTransactions({ page: 1, limit: 20 }),
      ]);
      setBalance(walletRes.data.data.walletBalance);
      updateUser({ walletBalance: walletRes.data.data.walletBalance });
      setTransactions(txRes.data.data, txRes.data.pagination);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load wallet data.');
    } finally {
      setLoadingWallet(false);
    }
  };

  const openRazorpayCheckout = ({ orderId, keyId, amount }) => {
    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        // Use server-provided keyId; fall back to frontend env
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: 'INR',
        name: 'Bidzy',
        description: `Add ₹${amount} to your wallet`,
        order_id: orderId,
        prefill: {},
        theme: { color: '#16a34a' },
        handler: (response) => resolve(response),
        modal: {
          ondismiss: () => reject(new Error('DISMISSED')),
        },
      });
      rzp.open();
    });
  };

  const handleTopUp = async (e) => {
    e.preventDefault();
    const amount = Number(topUpAmount);
    if (!amount || amount < 100) {
      toast.error('Minimum top-up amount is ₹100');
      return;
    }

    setTopping(true);
    try {
      const orderRes = await walletService.createOrder(amount);
      const { orderId, isMock, keyId } = orderRes.data.data;

      if (isMock) {
        // ─── Mock Mode (no Razorpay keys set) ───────────────────────────
        const verifyRes = await walletService.verifyPayment({
          orderId,
          paymentId: `mock_pay_${Date.now()}`,
        });
        const { walletBalance: newBalance, amountAdded } = verifyRes.data.data;
        setBalance(newBalance);
        updateUser({ walletBalance: newBalance });
        toast.success(`₹${amountAdded} added to your wallet! (Dev Mock)`);
        setTopUpAmount('');
        fetchWalletData();
        return;
      }

      // ─── Live Razorpay checkout ──────────────────────────────────────
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay. Check your internet connection.');
        return;
      }

      let razorpayResponse;
      try {
        razorpayResponse = await openRazorpayCheckout({ orderId, keyId, amount });
      } catch (dismissErr) {
        // User closed the modal — silently reset state
        toast('Payment cancelled.', { icon: 'ℹ️' });
        return;
      }

      // Verify payment with backend
      const verifyRes = await walletService.verifyPayment({
        orderId,
        paymentId: razorpayResponse.razorpay_payment_id,
        signature: razorpayResponse.razorpay_signature,
      });
      const { walletBalance: newBalance, amountAdded } = verifyRes.data.data;
      setBalance(newBalance);
      updateUser({ walletBalance: newBalance });
      toast.success(`₹${amountAdded} added to your wallet! 🎉`);
      setTopUpAmount('');
      fetchWalletData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setTopping(false);
    }
  };

  if (loadingWallet) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-white/20 rounded-xl">
            <Wallet className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold tracking-wider uppercase text-white/80">
            Bidzy Wallet
          </span>
        </div>
        <p className="text-5xl font-black tracking-tight">
          ₹{walletBalance.toLocaleString('en-IN')}
        </p>
        <p className="text-sm text-white/70 mt-2 font-medium">Available Balance</p>
      </div>

      {/* Top-Up Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-green-600" />
          Add Money to Wallet
        </h2>

        <form onSubmit={handleTopUp} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IndianRupee className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              placeholder="Enter amount (min ₹100)"
              min="100"
              className="block w-full pl-8 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-semibold text-gray-900"
            />
          </div>
          <button
            type="submit"
            disabled={topping}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm whitespace-nowrap"
          >
            {topping ? 'Processing...' : 'Add Money'}
          </button>
        </form>

        {/* Quick select amounts */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-gray-400 font-semibold">Quick Select:</span>
          {[200, 500, 1000, 2000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setTopUpAmount(String(preset))}
              className="px-3 py-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition"
            >
              ₹{preset}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Transaction History</h2>

        {transactions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Wallet className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No transactions yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const style = TRANSACTION_TYPE_STYLES[tx.type] || TRANSACTION_TYPE_STYLES.credit;
              const Icon = style.icon;
              const isPositive = ['credit', 'refund', 'deposit_return'].includes(tx.type);

              return (
                <div
                  key={tx._id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${style.bg}`}>
                      <Icon className={`h-4 w-4 ${style.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{style.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">
                        {tx.description}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
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

export default CustomerWallet;
