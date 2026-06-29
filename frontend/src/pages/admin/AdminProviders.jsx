/**
 * pages/admin/AdminProviders.jsx — Admin Provider KYC Management
 */

import React, { useState, useEffect } from 'react';
import * as adminService from '../../services/admin/admin.service.js';
import Spinner from '../../components/common/Spinner.jsx';
import { ShieldCheck, Search, ShieldAlert, CheckCircle, XCircle, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  approved: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-700',
  rejected: 'bg-red-50 text-red-700',
  unsubmitted: 'bg-gray-50 text-gray-700',
};

const AdminProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    fetchProviders();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProviders();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await adminService.getAllProviders(params);
      setProviders(res.data.data);
    } catch (err) {
      toast.error('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = async (provider) => {
    // Fetch full details including verification docs
    try {
      const res = await adminService.getProviderById(provider._id);
      setSelectedProvider(res.data.data);
      setAdminNote('');
    } catch (err) {
      toast.error('Failed to fetch provider details');
    }
  };

  const handleVerify = async () => {
    if (!window.confirm('Approve this provider? They will receive a verified badge.')) return;
    setActionLoading(true);
    try {
      await adminService.verifyProvider(selectedProvider.provider._id);
      toast.success('Provider verified successfully');
      setSelectedProvider(null);
      fetchProviders();
    } catch (err) {
      toast.error('Failed to verify provider');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!adminNote.trim()) {
      toast.error('Please provide a reason for rejection in the note field.');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.rejectProvider(selectedProvider.provider._id, { adminNote });
      toast.success('Provider verification rejected');
      setSelectedProvider(null);
      fetchProviders();
    } catch (err) {
      toast.error('Failed to reject provider');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-green-500" /> Provider KYC Approvals
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review identity documents and approve service providers.</p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search providers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="unsubmitted">Unsubmitted</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><Spinner size="md" /></div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12">
            <ShieldAlert className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No providers found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Provider</th>
                  <th className="px-6 py-4">Speciality</th>
                  <th className="px-6 py-4">Verification Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {providers.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center text-green-700 font-bold">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-sm font-semibold text-gray-700">
                      {p.speciality || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold capitalize ${STATUS_COLORS[p.verificationStatus] || STATUS_COLORS.unsubmitted}`}>
                        {p.verificationStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleReviewClick(p)}
                        className="text-green-600 hover:text-green-800 font-bold text-sm bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-black text-gray-900">Review Provider Verification</h2>
              <button onClick={() => setSelectedProvider(null)} className="p-2 hover:bg-gray-200 rounded-full transition">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Provider Details</h3>
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500">Name</span>
                    <p className="font-bold text-gray-900">{selectedProvider.provider.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Email</span>
                    <p className="font-bold text-gray-900">{selectedProvider.provider.email}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Speciality</span>
                    <p className="font-bold text-gray-900 capitalize">{selectedProvider.provider.speciality || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Phone</span>
                    <p className="font-bold text-gray-900">{selectedProvider.provider.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {!selectedProvider.verification ? (
                <div className="text-center py-6 bg-amber-50 rounded-xl border border-amber-200">
                  <ShieldAlert className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-amber-700 font-bold">No Documents Submitted</p>
                  <p className="text-xs text-amber-600 mt-1">This provider has not submitted their KYC documents yet.</p>
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Submitted Documents</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedProvider.verification.aadhaarUrl && (
                        <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-gray-400" />
                            <div>
                              <p className="font-bold text-gray-900 text-sm">Aadhaar Card</p>
                              {(() => {
                                const url = selectedProvider.verification.aadhaarUrl;
                                const isCloudinary = url.startsWith('http');
                                const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                                const fullUrl = isCloudinary ? url : `${baseUrl}/${url.replace(/\\/g, '/').replace(/^\/+/, '')}`;
                                return <a href={fullUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View Document</a>;
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                      {selectedProvider.verification.panUrl && (
                        <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-gray-400" />
                            <div>
                              <p className="font-bold text-gray-900 text-sm">PAN Card</p>
                              {(() => {
                                const url = selectedProvider.verification.panUrl;
                                const isCloudinary = url.startsWith('http');
                                const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                                const fullUrl = isCloudinary ? url : `${baseUrl}/${url.replace(/\\/g, '/').replace(/^\/+/, '')}`;
                                return <a href={fullUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View Document</a>;
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedProvider.verification.status !== 'approved' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Rejection Note (if rejecting)</label>
                      <textarea
                        rows="2"
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder="Why is this being rejected?"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedProvider(null)}
                className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition"
              >
                Close
              </button>
              
              {selectedProvider.verification && selectedProvider.verification.status !== 'approved' && (
                <>
                  <button 
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl transition flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" /> Reject
                  </button>
                  <button 
                    onClick={handleVerify}
                    disabled={actionLoading}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" /> Approve & Verify
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProviders;
