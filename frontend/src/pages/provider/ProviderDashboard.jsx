/**
 * pages/provider/ProviderDashboard.jsx
 *
 * Responsibilities:
 *  - Real-time job feed (displays open local jobs)
 *  - Display rating, earnings summary
 *  - List active bookings assigned to this provider
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../../store/auth/authStore.js';
import useSocket from '../../hooks/useSocket.js';
import * as jobService from '../../services/jobs/job.service.js';
import * as bookingService from '../../services/bookings/booking.service.js';
import Spinner from '../../components/common/Spinner.jsx';
import toast from 'react-hot-toast';
import { 
  Briefcase, Star, IndianRupee, MapPin, 
  ArrowRight, Clock, ShieldCheck, ChevronRight 
} from 'lucide-react';

const STATUS_BADGE = {
  active: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const ProviderDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const socket = useSocket();

  const [openJobs, setOpenJobs] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Suppress unmounted state errors with AbortController
  useEffect(() => {
    const abortController = new AbortController();
    fetchDashboardData(abortController.signal);
    return () => abortController.abort();
  }, []);

  // Listen for new jobs in real-time
  useEffect(() => {
    if (!socket) return;
    
    const handleNewJob = (newJob) => {
      setOpenJobs(prev => [newJob, ...prev]);
    };

    socket.on('job:new', handleNewJob);
    
    // Listen for booking updates
    const handleBookingUpdate = (data) => {
      if (data.status !== 'active') {
        setActiveBookings(prev => prev.filter(b => b._id !== data.bookingId));
      }
    };
    socket.on('booking:updated', handleBookingUpdate);

    // Listen for rating updates
    const handleRatingUpdate = (data) => {
      useAuthStore.getState().updateUser({ rating: data.rating, totalReviews: data.totalReviews });
    };
    socket.on('user:rating_updated', handleRatingUpdate);

    return () => {
      socket.off('job:new', handleNewJob);
      socket.off('booking:updated', handleBookingUpdate);
      socket.off('user:rating_updated', handleRatingUpdate);
    };
  }, [socket]);

  const fetchDashboardData = async (signal) => {
    setLoading(true);
    try {
      const [jobsRes, bookingsRes] = await Promise.all([
        jobService.getOpenJobs(),
        bookingService.getProviderBookings({ status: 'active' }),
      ]);
      if (!signal.aborted) {
        setOpenJobs(jobsRes.data.data || []);
        setActiveBookings(bookingsRes.data.data || []);
      }
    } catch (err) {
      if (!signal?.aborted) {
        console.error(err);
        toast.error('Failed to load provider dashboard data.');
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight !text-white">
            Welcome, {user?.name}!
          </h1>
          <p className="text-sm text-green-100 font-medium leading-relaxed">
            Ready to bid on new jobs? Browse open local listings below, place your bids, and secure guaranteed payouts via our automated escrow.
          </p>
          <button
            onClick={() => navigate('/provider/jobs')}
            className="inline-flex items-center gap-2 px-5 py-3 bg-white text-green-700 font-extrabold rounded-xl hover:bg-green-50 transition shadow-sm text-sm"
          >
            <Briefcase className="h-4 w-4" /> Browse Open Jobs
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Rating */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Your Rating</span>
            <p className="text-3xl font-black text-gray-900 flex items-center gap-1">
              {user?.rating?.toFixed(1) || '5.0'}
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
            </p>
            <p className="text-xs text-gray-400 font-semibold mt-1">Based on {user?.totalReviews || 0} reviews</p>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Bookings</span>
            <p className="text-3xl font-black text-gray-900">{activeBookings.length}</p>
            <Link to="/provider/bookings" className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 font-bold transition mt-2">
              View Active Bookings <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Verification status */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Verification Status</span>
            <p className={`text-2xl font-black mt-2 capitalize ${user?.verified ? 'text-green-600' : 'text-amber-500'}`}>
              {user?.verified ? 'Verified' : 'Pending'}
            </p>
            <p className="text-xs text-gray-400 font-semibold mt-1">
              {user?.verified ? 'Account fully approved' : 'Upload document to verify'}
            </p>
          </div>
        </div>
      </div>

      {/* Active Bookings Section */}
      {activeBookings.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Active Jobs in Progress</h2>
          <div className="space-y-3">
            {activeBookings.slice(0, 3).map((booking) => (
              <div
                key={booking._id}
                onClick={() => navigate(`/provider/bookings/${booking._id}`)}
                className="flex items-center justify-between p-4 border border-gray-100 hover:border-green-300 rounded-xl cursor-pointer hover:bg-gray-50/50 transition"
              >
                <div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGE[booking.status] || STATUS_BADGE.active} capitalize`}>
                    {booking.status}
                  </span>
                  <h3 className="font-bold text-gray-900 text-sm mt-1 capitalize">{booking.jobId?.service}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Customer: {booking.customerId?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-black text-green-700">₹{booking.basePrice}</p>
                    <p className="text-[10px] text-gray-400 font-semibold">Earnings</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Open Bidding Feed */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Open Bidding Feed</h2>
          <Link to="/provider/jobs" className="text-xs text-green-600 hover:text-green-700 font-bold flex items-center gap-1">
            Browse All Jobs <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {openJobs.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">No open jobs found in your area.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-150">
            {openJobs.slice(0, 5).map((job) => (
              <div
                key={job._id}
                onClick={() => navigate(`/provider/jobs/${job._id}`)}
                className="py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 -mx-6 px-6 transition first:pt-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 capitalize">{job.service}</span>
                    <span className="inline-flex px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] font-bold capitalize">
                      {job.urgency} urgency
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-md">{job.description}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {job.address?.city && (
                    <div className="flex items-center gap-1 text-xs text-gray-400 font-semibold">
                      <MapPin className="h-3.5 w-3.5 text-gray-300" />
                      {job.address.city}
                    </div>
                  )}
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

export default ProviderDashboard;
