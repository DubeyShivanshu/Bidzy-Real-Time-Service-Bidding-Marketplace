/**
 * Responsibilities:
 *  - Elegant Hero Banner greeting the logged-in customer.
 *  - Quick stats: Wallet Balance (links to wallet) and Active Bookings count (links to bookings).
 *  - A service categories grid (Plumbing, Electrical, Cleaning, Appliance, Gardening) which links to the Post Job page.
 *  - A list of recent jobs posted by this customer, showing status and bid count.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/auth/authStore.js';
import * as jobService from '../../services/jobs/job.service.js';
import * as walletService from '../../services/wallet/wallet.service.js';
import * as bookingService from '../../services/bookings/booking.service.js';
import Spinner from '../../components/common/Spinner.jsx';
import toast from 'react-hot-toast';
import { 
  Wallet, PlusCircle, ArrowRight, Wrench, Zap, 
  Sparkles, ShieldCheck, Clock, CheckCircle2, ChevronRight 
} from 'lucide-react';

const CATEGORIES = [
  { name: 'plumbing', label: 'Plumbing', icon: Wrench, color: 'from-blue-500 to-indigo-500', desc: 'Leaks, pipes & fixtures' },
  { name: 'electrical', label: 'Electrical', icon: Zap, color: 'from-amber-500 to-orange-500', desc: 'Wiring, lights & repairs' },
  { name: 'cleaning', label: 'Cleaning', icon: Sparkles, color: 'from-teal-500 to-emerald-500', desc: 'Deep clean & dusting' },
  { name: 'appliance', label: 'Appliance', icon: ShieldCheck, color: 'from-rose-500 to-pink-500', desc: 'TV, Fridge & AC repair' },
];

const STATUS_BADGE = {
  open: 'bg-green-50 text-green-700 border-green-200',
  bidding: 'bg-blue-50 text-blue-700 border-blue-200',
  assigned: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

export const CustomerDashboard = () => {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();
    fetchDashboardData(abortController.signal);
    return () => abortController.abort();
  }, []);

  const fetchDashboardData = async (signal) => {
    setLoading(true);
    try {
      // Get wallet, jobs, and bookings
      const [walletRes, jobsRes, bookingsRes] = await Promise.all([
        walletService.getWallet(),
        jobService.getMyJobs(),
        bookingService.getCustomerBookings({ status: 'active' }),
      ]);
      
      if (!signal.aborted) {
        // Update wallet balance in auth store
        updateUser({ walletBalance: walletRes.data.data.walletBalance });
        setJobs(jobsRes.data.data || []);
        setBookingsCount(bookingsRes.data.pagination?.total || bookingsRes.data.data?.length || 0);
      }
    } catch (err) {
      if (!signal?.aborted) {
        console.error(err);
        toast.error('Failed to load dashboard data.');
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight !text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-green-100 font-medium leading-relaxed">
            Need something fixed or installed? Post a job, receive bids from verified local professionals, and pay safely via our escrow system.
          </p>
          <button
            onClick={() => navigate('/customer/post-job')}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-green-700 font-extrabold rounded-xl hover:bg-green-50 transition shadow-sm text-sm"
          >
            <PlusCircle className="h-4 w-4" /> Post a New Job
          </button>
        </div>
        
        {/* Glow effect */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none rounded-r-3xl" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Wallet Balance Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Wallet Balance</span>
            <p className="text-3xl font-black text-gray-900">₹{user?.walletBalance?.toLocaleString('en-IN') || '0'}</p>
            <Link to="/customer/wallet" className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-bold transition mt-2">
              Top Up Wallet <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-3.5 bg-green-50 text-green-600 rounded-2xl">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        {/* Active Bookings Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Bookings</span>
            <p className="text-3xl font-black text-gray-900">{bookingsCount}</p>
            <Link to="/customer/bookings" className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-bold transition mt-2">
              View Bookings <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-3.5 bg-green-50 text-green-600 rounded-2xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Service Categories Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">Hire a Local Professional</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => navigate(`/customer/post-job?category=${cat.name}`)}
                className="bg-white border border-gray-200 hover:border-green-500 rounded-2xl p-5 cursor-pointer hover:shadow-md transition duration-150 flex flex-col justify-between group"
              >
                <div>
                  <div className={`inline-flex p-2.5 bg-gradient-to-br ${cat.color} text-white rounded-xl mb-3.5`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-base group-hover:text-green-600 transition">{cat.label}</h3>
                  <p className="text-xs text-gray-400 mt-1 font-medium leading-relaxed">{cat.desc}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-green-600 font-bold mt-4">
                  Post Job <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Posted Jobs */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Your Posted Jobs</h2>
          <button
            onClick={() => navigate('/customer/post-job')}
            className="text-xs text-green-600 hover:text-green-700 font-bold flex items-center gap-1"
          >
            Post a Job <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">You haven't posted any jobs yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job._id}
                onClick={() => navigate(`/customer/jobs/${job._id}`)}
                className="py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 -mx-6 px-6 transition first:pt-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 capitalize">{job.service}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGE[job.status] || STATUS_BADGE.open} capitalize`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-md">{job.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-semibold">Bids Received</p>
                    <p className="text-sm font-black text-gray-900">{job.bidCount || job.bids?.length || 0}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
