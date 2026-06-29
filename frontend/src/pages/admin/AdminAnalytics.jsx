/**
 * pages/admin/AdminAnalytics.jsx — Admin Analytics & Growth Dashboard
 */

import React, { useState, useEffect } from 'react';
import * as adminService from '../../services/admin/admin.service.js';
import Spinner from '../../components/common/Spinner.jsx';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Activity, BarChart3, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, overRes] = await Promise.all([
        adminService.getRevenueAnalytics(),
        adminService.getPlatformOverview()
      ]);
      setRevenueData(revRes.data.data);
      setOverview(overRes.data.data);
    } catch (err) {
      toast.error('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div>;
  }

  // Format dates for display (e.g. "24 Jun")
  const formattedRevenue = revenueData.map(d => ({
    ...d,
    displayDate: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-100 shadow-xl rounded-xl">
          <p className="font-bold text-gray-900 mb-2 border-b border-gray-100 pb-2">{payload[0].payload.displayDate}</p>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-green-600">
              Platform Revenue: ₹{payload[0].value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Total Booking Vol: ₹{payload[0].payload.totalBookingValue?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-purple-600" /> Platform Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">30-day growth and revenue metrics.</p>
      </div>

      {/* 30 Day Quick Stats */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-xl text-blue-600"><Users className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">New Users (30d)</p>
              <h3 className="text-2xl font-black text-gray-900">+{overview.thirtyDayStats.newUsers}</h3>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-purple-50 rounded-xl text-purple-600"><Activity className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">New Jobs (30d)</p>
              <h3 className="text-2xl font-black text-gray-900">+{overview.thirtyDayStats.newJobs}</h3>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-green-50 rounded-xl text-green-600"><TrendingUp className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">New Bookings (30d)</p>
              <h3 className="text-2xl font-black text-gray-900">+{overview.thirtyDayStats.newBookings}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
          <Banknote className="h-5 w-5 text-green-500" />
          <h2 className="text-lg font-bold text-gray-900">Platform Revenue (Last 30 Days)</h2>
        </div>
        
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dx={-10} tickFormatter={(val) => `₹${val}`} />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
