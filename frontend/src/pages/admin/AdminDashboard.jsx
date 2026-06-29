/**
 * pages/admin/AdminDashboard.jsx — Admin Live Metrics Dashboard
 */

import React, { useState, useEffect, useRef } from 'react';
import * as adminService from '../../services/admin/admin.service.js';
import * as avatarService from '../../services/auth/avatar.service.js';
import useAuthStore from '../../store/auth/authStore.js';
import Spinner from '../../components/common/Spinner.jsx';
import { 
  Users, Briefcase, CheckSquare, AlertTriangle, ShieldCheck, 
  Banknote, Wallet, XCircle, Clock, Activity, AlertCircle, Camera, Trash2 
} from 'lucide-react';
import toast from 'react-hot-toast';

const MetricCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className={`bg-white border rounded-2xl p-6 shadow-sm relative overflow-hidden group hover:shadow-md transition`}>
    <div className={`absolute top-0 right-0 p-8 -mr-6 -mt-6 rounded-full bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition`} />
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-2 font-semibold">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-sm`}>
        <Icon className="h-6 w-6" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user, updateUser } = useAuthStore();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchMetrics = async () => {
    try {
      const res = await adminService.getDashboardMetrics();
      setMetrics(res.data.data);
    } catch (err) {
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const res = await avatarService.uploadAvatar('admin', file);
      updateUser(res.data.data.user);
      toast.success('Admin profile picture updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    
    setAvatarLoading(true);
    try {
      const res = await avatarService.deleteAvatar('admin');
      updateUser(res.data.data.user);
      toast.success('Admin profile picture removed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove image');
    } finally {
      setAvatarLoading(false);
    }
  };

  if (loading && !metrics) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!metrics) return null;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      
      {/* Admin Profile Section */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex items-center gap-6">
        <div className="relative group flex-shrink-0">
          <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-sm overflow-hidden ${avatarLoading ? 'opacity-50' : ''}`}>
            {user?.avatar ? (
              <img src={user.avatar} alt="Admin" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black text-white">{user?.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>

          <div 
            className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-5 w-5 text-white mb-0.5" />
            <span className="text-[9px] text-white font-bold">Change</span>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarUpload} 
            accept="image/*" 
            className="hidden" 
          />

          {user?.avatar && (
            <button 
              onClick={handleAvatarDelete}
              disabled={avatarLoading}
              className="absolute -bottom-2 -right-2 p-1 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg shadow-sm transition"
              title="Remove Picture"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-black text-gray-900">{user?.name}</h2>
          <p className="text-sm font-bold text-green-600 uppercase tracking-wider">Super Administrator</p>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Overview</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            Live platform metrics (auto-updates every 30s)
          </p>
        </div>
      </div>

      {/* Action Required Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard 
          title="Pending Verifications" 
          value={metrics.actionable.pendingVerifications} 
          icon={ShieldCheck} 
          color="from-amber-400 to-amber-600" 
          subtext="Providers awaiting KYC approval"
        />
        <MetricCard 
          title="Open Disputes" 
          value={metrics.actionable.openDisputes} 
          icon={AlertTriangle} 
          color="from-red-400 to-red-600" 
          subtext="Issues requiring admin mediation"
        />
      </div>

      {/* Finances Section */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Financials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <MetricCard 
            title="Total Platform Revenue" 
            value={`₹${metrics.finances.platformRevenue?.toLocaleString('en-IN')}`} 
            icon={Banknote} 
            color="from-green-500 to-emerald-700" 
            subtext="Earnings from 5% fee on completed bookings"
          />
          <MetricCard 
            title="Pending Escrow Hold" 
            value={`₹${metrics.finances.pendingEscrow?.toLocaleString('en-IN')}`} 
            icon={Wallet} 
            color="from-blue-500 to-indigo-700" 
            subtext="Customer funds held for active bookings"
          />
        </div>
      </div>

      {/* Users & Jobs Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">User Demographics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard title="Customers" value={metrics.users.customers} icon={Users} color="from-gray-700 to-gray-900" />
            <MetricCard title="Total Providers" value={metrics.users.providers} icon={Briefcase} color="from-gray-700 to-gray-900" />
            <MetricCard title="Verified Providers" value={metrics.users.verifiedProviders} icon={ShieldCheck} color="from-green-400 to-green-600" />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Job & Booking Activity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MetricCard title="Total Jobs" value={metrics.jobs.total} icon={Activity} color="from-purple-500 to-purple-700" />
            <MetricCard title="Open Jobs" value={metrics.jobs.open} icon={Clock} color="from-blue-400 to-blue-600" />
            <MetricCard title="Completed Jobs" value={metrics.jobs.completed} icon={CheckSquare} color="from-green-500 to-green-700" />
            <MetricCard title="Active Bookings" value={metrics.bookings.active} icon={AlertCircle} color="from-amber-500 to-amber-700" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
