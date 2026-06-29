/**
 * pages/admin/AdminDashboard.jsx — Admin Live Metrics Dashboard
 */

import React, { useState, useEffect } from 'react';
import * as adminService from '../../services/admin/admin.service.js';
import Spinner from '../../components/common/Spinner.jsx';
import { 
  Users, Briefcase, CheckSquare, AlertTriangle, ShieldCheck, 
  Banknote, Wallet, XCircle, Clock, Activity, AlertCircle 
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
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading && !metrics) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!metrics) return null;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
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
