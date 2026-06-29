import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as bookingService from '../../services/bookings/booking.service.js';
import useBookingStore from '../../store/bookings/bookingStore.js';
import Spinner from '../../components/common/Spinner.jsx';
import { CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';

const STATUS_STYLES = {
  active: { label: 'Active', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Clock },
  completed: { label: 'Completed', color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-gray-600', bg: 'bg-gray-100 border-gray-200', icon: XCircle },
};

const TABS = ['all', 'active', 'completed', 'cancelled'];

export const CustomerBookings = () => {
  const navigate = useNavigate();
  const { bookings, setBookings, pagination } = useBookingStore();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await bookingService.getCustomerBookings(params);
      setBookings(res.data.data, res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Track all your service bookings.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-bold capitalize rounded-t-lg transition ${
              activeTab === tab
                ? 'text-green-700 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <CheckCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <p className="text-sm font-semibold text-gray-600">No {activeTab !== 'all' ? activeTab : ''} bookings found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const style = STATUS_STYLES[booking.status] || STATUS_STYLES.active;
            const Icon = style.icon;
            return (
              <div
                key={booking._id}
                onClick={() => navigate(`/customer/bookings/${booking._id}`)}
                className="bg-white border border-gray-200 rounded-xl p-5 cursor-pointer hover:border-green-400 hover:shadow-md transition flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.bg} ${style.color}`}>
                      <Icon className="h-3 w-3" />
                      {style.label}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 capitalize">
                      {booking.jobId?.service}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 font-medium truncate mt-1">
                    {booking.jobId?.description}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span className="font-semibold">
                      Provider: <span className="text-gray-700">{booking.providerId?.name || '—'}</span>
                    </span>
                    <span>
                      {new Date(booking.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <p className="text-xl font-black text-gray-900">₹{booking.totalAmount}</p>
                  <p className="text-xs text-gray-400 font-semibold mt-0.5">Total Paid</p>
                  <ChevronRight className="h-5 w-5 text-gray-300 mt-2" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;
