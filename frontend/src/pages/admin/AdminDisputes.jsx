/**
 * pages/admin/AdminDisputes.jsx — Admin Disputes Management
 */

import React, { useState, useEffect } from 'react';
import * as adminService from '../../services/admin/admin.service.js';
import * as walletService from '../../services/wallet/wallet.service.js';
import useAuthStore from '../../store/auth/authStore.js';
import Spinner from '../../components/common/Spinner.jsx';
import { Gavel, Search, ShieldAlert, CheckCircle, Clock, X, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  open: 'bg-red-50 text-red-700',
  under_review: 'bg-amber-50 text-amber-700',
  resolved: 'bg-green-50 text-green-700',
  closed: 'bg-gray-50 text-gray-700',
};

const AdminDisputes = () => {
  const { updateUser } = useAuthStore();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('open'); // default to open
  
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  const [resolution, setResolution] = useState('');
  const [issueRefund, setIssueRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (statusFilter) params.status = statusFilter;

      const res = await adminService.getAllDisputes(params);
      setDisputes(res.data.data);
    } catch (err) {
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = async (disputeId) => {
    try {
      const res = await adminService.getAdminDisputeById(disputeId);
      const dispute = res.data.data;
      setSelectedDispute(dispute);
      setResolution('');
      setIssueRefund(false);
      setRefundAmount(dispute.bookingId?.totalAmount || '');
      
      // Fetch chat for context
      setChatLoading(true);
      const bookingIdForChat = dispute.bookingId?._id || dispute.bookingId;
      if (bookingIdForChat) {
        const chatRes = await adminService.getBookingChat(bookingIdForChat);
        setChatMessages(chatRes.data.data);
      } else {
        setChatMessages([]);
      }
    } catch (err) {
      toast.error('Failed to fetch dispute details');
    } finally {
      setChatLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      toast.error('Resolution note is required');
      return;
    }
    
    let payload = { resolution, issueRefund };
    if (issueRefund) {
      const amt = Number(refundAmount);
      if (!amt || amt <= 0) return toast.error('Enter a valid refund amount');
      if (amt > selectedDispute.bookingId.totalAmount) {
        return toast.error('Refund cannot exceed total booking amount');
      }
      payload.refundAmount = amt;
    }

    setActionLoading(true);
    try {
      await adminService.resolveDispute(selectedDispute._id, payload);
      toast.success('Dispute resolved successfully');
      setSelectedDispute(null);
      fetchDisputes();
      
      // Instantly sync the global wallet balance in the Navbar
      try {
        const walletRes = await walletService.getWallet();
        updateUser({ walletBalance: walletRes.data.data.walletBalance });
      } catch (err) {
        console.error('Failed to sync wallet after dispute resolution', err);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Gavel className="h-6 w-6 text-red-500" /> Dispute Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Mediate conflicts, review chat logs, and issue refunds.</p>
        </div>

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><Spinner size="md" /></div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-12">
            <ShieldAlert className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No disputes found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Raised By</th>
                  <th className="px-6 py-4">Against</th>
                  <th className="px-6 py-4">Amount Held</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {disputes.map((d) => {
                  const raisedBy = d.raisedBy;
                  const against = d.raisedByRole === 'customer' ? d.bookingId?.providerId : d.bookingId?.customerId;
                  
                  return (
                    <tr key={d._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{raisedBy?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 capitalize">{d.raisedByRole}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900">{against?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 capitalize">{d.raisedByRole === 'customer' ? 'Provider' : 'Customer'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900">₹{d.bookingId?.totalAmount || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold capitalize ${STATUS_COLORS[d.status] || STATUS_COLORS.open}`}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleReviewClick(d._id)}
                          className="text-red-600 hover:text-red-800 font-bold text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                        >
                          {d.status === 'resolved' || d.status === 'closed' ? 'View' : 'Resolve'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review & Resolve Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/50 backdrop-blur-sm p-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-xl flex flex-col md:flex-row" style={{maxHeight: '90vh', height: '90vh'}}>
            
            {/* Left side: Chat Monitor */}
            <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50 flex flex-col min-h-0">
              <div className="p-4 border-b border-gray-200 flex items-center gap-2 bg-white flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-gray-900">Booking Chat Log</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatLoading ? (
                  <div className="flex justify-center py-8"><Spinner size="sm" /></div>
                ) : chatMessages.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-8">No messages in this booking.</p>
                ) : (
                  chatMessages.map(msg => (
                    <div key={msg._id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-gray-900">{msg.senderId?.name} <span className="text-gray-400 font-normal">({msg.senderId?.role})</span></span>
                        <span className="text-[10px] text-gray-400">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-gray-700">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right side: Resolution Form */}
            <div className="w-full md:w-1/2 flex flex-col min-h-0">
              {/* Fixed Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
                <h2 className="text-lg font-black text-gray-900">Resolve Dispute</h2>
                <button onClick={() => setSelectedDispute(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {/* Scrollable Body */}
              <div className="p-6 space-y-6 flex-1 overflow-y-auto bg-white">
                {/* Dispute Info */}
                <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Reason for Dispute</p>
                  <p className="font-medium text-red-900">"{selectedDispute.reason}"</p>
                  <p className="text-xs text-red-500 mt-2">
                    Raised by <b>{selectedDispute.raisedBy?.name}</b> ({selectedDispute.raisedByRole})
                  </p>
                </div>

                {/* Booking Info */}
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 border border-gray-100">
                  <div>
                    <span className="text-xs text-gray-500">Customer</span>
                    <p className="font-bold text-gray-900">{selectedDispute.bookingId?.customerId?.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Provider</span>
                    <p className="font-bold text-gray-900">{selectedDispute.bookingId?.providerId?.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Total Charged</span>
                    <p className="font-bold text-gray-900">₹{selectedDispute.bookingId?.totalAmount}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Escrow Status</span>
                    <p className="font-bold text-gray-900 capitalize">{selectedDispute.bookingId?.escrowStatus}</p>
                  </div>
                </div>

                {/* Resolution Action */}
                {selectedDispute.status === 'open' || selectedDispute.status === 'under_review' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Admin Resolution Note</label>
                      <textarea
                        rows="3"
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Explain how this dispute is being resolved..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <label className="flex items-center gap-2 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={issueRefund}
                          onChange={(e) => setIssueRefund(e.target.checked)}
                          className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                        />
                        <span className="text-sm font-bold text-gray-900">Issue Refund to Customer</span>
                      </label>

                      {issueRefund && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 mb-1">Refund Amount (₹)</label>
                          <input
                            type="number"
                            min="1"
                            max={selectedDispute.bookingId?.totalAmount}
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                          />
                          <p className="text-[10px] text-gray-400 mt-1">Max available to refund: ₹{selectedDispute.bookingId?.totalAmount}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Already Resolved
                    </p>
                    <p className="font-medium text-green-900 mt-2">{selectedDispute.resolution}</p>
                    {selectedDispute.refundIssued && (
                      <p className="text-sm font-bold text-green-700 mt-3 border-t border-green-200 pt-2">
                        Refunded: ₹{selectedDispute.refundAmount}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Fixed Footer — always visible */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
                <button 
                  onClick={() => setSelectedDispute(null)}
                  className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition"
                >
                  Close
                </button>
                
                {(selectedDispute.status === 'open' || selectedDispute.status === 'under_review') && (
                  <button 
                    onClick={handleResolve}
                    disabled={actionLoading}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Gavel className="h-4 w-4" /> Resolve Dispute
                  </button>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDisputes;
