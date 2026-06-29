/**
 * app/routes/AdminRoutes.jsx — Admin Route Definitions
 *
 * All routes require role=admin authentication (via ProtectedRoute).
 * Wrapped in AdminLayout for admin sidebar navigation.
 *
 * Routes:
 *  /admin/dashboard    → AdminDashboard.jsx (live metrics)
 *  /admin/users        → AdminUsers.jsx
 *  /admin/providers    → AdminProviders.jsx
 *  /admin/bookings     → AdminBookings.jsx
 *  /admin/disputes     → AdminDisputes.jsx
 *  /admin/analytics    → AdminAnalytics.jsx
 *  /admin/chat/:id     → AdminChatMonitor.jsx (read-only)
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout.jsx';
import AdminDashboard from '../../pages/admin/AdminDashboard.jsx';
import AdminUsers from '../../pages/admin/AdminUsers.jsx';
import AdminProviders from '../../pages/admin/AdminProviders.jsx';
import AdminWallet from '../../pages/admin/AdminWallet.jsx';
import AdminDisputes from '../../pages/admin/AdminDisputes.jsx';
import AdminBookings from '../../pages/admin/AdminBookings.jsx';
import AdminAnalytics from '../../pages/admin/AdminAnalytics.jsx';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="providers" element={<AdminProviders />} />
        <Route path="wallet" element={<AdminWallet />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="disputes" element={<AdminDisputes />} />
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;

