/**
 * User's Disputes View
 *
 * Responsibilities:
 *  - Fetch disputes raised by the current user (Customer or Provider)
 *  - Display a list of disputes with their status and booking info
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/auth/authStore.js';
import * as disputeService from '../../services/disputes/dispute.service.js';
import Spinner from '../../components/common/Spinner.jsx';
import { ShieldAlert, Clock, CheckCircle, Info, ChevronRight, Gavel } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'text-red-700 bg-red-50 border-red-200', icon: ShieldAlert },
  under_review: { label: 'Under Review', color: 'text-amber-700 bg-amber-50 border-amber-200', icon: Clock },
  resolved: { label: 'Resolved', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle },
  closed: { label: 'Closed', color: 'text-gray-700 bg-gray-50 border-gray-200', icon: Info },
};

const DisputesList = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await disputeService.getMyDisputes();
      setDisputes(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load disputes.');
    } finally {
      setLoading(false);
    }
  };

  const rolePrefix = user?.role === 'customer' ? '/customer' : '/provider';

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-red-100 rounded-xl">
          <Gavel className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Disputes</h1>
          <p className="text-sm text-gray-500 mt-1">Track issues and resolutions for your bookings.</p>
        </div>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
          <ShieldAlert className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No Disputes Found</h3>
          <p className="text-sm text-gray-500 mt-1">You haven't raised any disputes.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-150">
            {disputes.map((dispute) => {
              const cfg = STATUS_CONFIG[dispute.status] || STATUS_CONFIG.open;
              const StatusIcon = cfg.icon;
              const booking = dispute.bookingId;
              const counterparty = user.role === 'customer' ? booking?.providerId : booking?.customerId;

              return (
                <li
                  key={dispute._id}
                  onClick={() => navigate(`${rolePrefix}/bookings/${booking?._id}`)}
                  className="p-6 hover:bg-gray-50 transition cursor-pointer flex flex-col sm:flex-row gap-4 justify-between"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.color}`}>
                        <StatusIcon className="h-3.5 w-3.5" />
                        {cfg.label}
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">
                        Raised on {new Date(dispute.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">
                        Booking with {counterparty?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                        "{dispute.reason}"
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:min-w-[120px]">
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Amount</p>
                      <p className="font-black text-gray-900">₹{booking?.totalAmount || 0}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-300" />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DisputesList;
