/**
 * pages/admin/AdminBookings.jsx — Admin Bookings Management
 */

import React, { useState, useEffect } from 'react';
import * as adminService from '../../services/admin/admin.service.js';
import Spinner from '../../components/common/Spinner.jsx';
import { Calendar, Search, ShieldAlert, X, DollarSign, Clock, MapPin, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  active: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  disputed: 'bg-orange-50 text-orange-700'
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;

      const res = await adminService.getAllBookings(params);
      setBookings(res.data.data);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (id) => {
    setDetailsLoading(true);
    try {
      const res = await adminService.getBookingById(id);
      setSelectedBooking(res.data.data); // { booking, transactions }
    } catch (err) {
      toast.error('Failed to fetch booking details');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Calendar className="h-6 w-6 text-blue-500" /> Platform Bookings
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitor all platform bookings, escrow status, and transactions.</p>
        </div>

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><Spinner size="md" /></div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <ShieldAlert className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No bookings found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Job Service</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => handleRowClick(b._id)}>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{b.jobId?.service || 'N/A'}</p>
                      <p className="text-xs text-gray-500 truncate w-48">{b.jobId?.description || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 text-sm">{b.customerId?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 text-sm">{b.providerId?.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold capitalize ${STATUS_COLORS[b.status] || 'bg-gray-50 text-gray-700'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:underline text-sm font-bold">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                Booking Details <span className="text-gray-400 font-normal text-sm">#{selectedBooking.booking._id}</span>
              </h2>
              <button onClick={() => setSelectedBooking(null)} className="p-2 hover:bg-gray-200 rounded-full transition">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-white space-y-8">
              {detailsLoading ? (
                <div className="flex justify-center py-12"><Spinner size="lg" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer & Provider Details */}
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-4">
                        <div className="p-3 bg-blue-100 text-blue-700 rounded-xl"><UserIcon className="h-5 w-5" /></div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase">Customer</p>
                          <p className="font-bold text-gray-900">{selectedBooking.booking.customerId?.name}</p>
                          <p className="text-sm text-gray-600">{selectedBooking.booking.customerId?.email}</p>
                          <p className="text-sm text-gray-600">{selectedBooking.booking.customerId?.phone}</p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-4">
                        <div className="p-3 bg-purple-100 text-purple-700 rounded-xl"><UserIcon className="h-5 w-5" /></div>
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase">Provider</p>
                          <p className="font-bold text-gray-900">{selectedBooking.booking.providerId?.name}</p>
                          <p className="text-sm text-gray-600">{selectedBooking.booking.providerId?.email}</p>
                          <p className="text-sm text-gray-600">{selectedBooking.booking.providerId?.phone}</p>
                        </div>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg">
                      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">Financial Breakdown</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Base Price (Provider Quote)</span>
                          <span className="font-semibold">₹{selectedBooking.booking.basePrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Platform Fee (5%)</span>
                          <span className="font-semibold text-green-400">+₹{selectedBooking.booking.platformFee}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">Security Deposit</span>
                          <span className="font-semibold text-amber-400">+₹{selectedBooking.booking.securityDeposit}</span>
                        </div>
                        <div className="border-t border-gray-700 my-2 pt-2 flex justify-between">
                          <span className="font-bold">Total Charged</span>
                          <span className="font-black text-xl">₹{selectedBooking.booking.totalAmount}</span>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-gray-800 rounded-xl">
                        <p className="text-xs text-gray-400 mb-1">Escrow Status</p>
                        <p className="font-bold text-white capitalize flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-blue-400" />
                          {selectedBooking.booking.escrowStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transaction Ledger */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" /> Transaction Ledger
                    </h3>
                    {selectedBooking.transactions.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No transactions recorded for this booking.</p>
                    ) : (
                      <div className="overflow-x-auto border border-gray-200 rounded-xl">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50">
                            <tr className="text-xs font-bold text-gray-500 uppercase">
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3">User ID</th>
                              <th className="px-4 py-3">Amount</th>
                              <th className="px-4 py-3">Description</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {selectedBooking.transactions.map((t) => (
                              <tr key={t._id} className="text-sm hover:bg-gray-50">
                                <td className="px-4 py-3 text-gray-500">{new Date(t.createdAt).toLocaleString()}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${t.type === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {t.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-500">{t.userId}</td>
                                <td className={`px-4 py-3 font-bold ${t.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                  {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                                </td>
                                <td className="px-4 py-3 text-gray-700">{t.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
