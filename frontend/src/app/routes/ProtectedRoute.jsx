/**
 * app/routes/ProtectedRoute.jsx — Route Guard Component
 *
 * Responsibilities:
 *  - Read authentication state from authStore
 *  - If not authenticated: redirect to appropriate login page
 *  - If authenticated but wrong role: redirect to role's dashboard
 *  - If authenticated + correct role: render Outlet (child routes)
 *
 * Usage:
 *  <Route element={<ProtectedRoute allowedRole="customer" />}>
 *    <Route path="dashboard" element={<CustomerDashboard />} />
 *  </Route>
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@store/auth/authStore.js';

const ProtectedRoute = ({ allowedRole }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    // Redirect user to their own role's dashboard if they try to access another portal
    if (user?.role === 'customer') {
      return <Navigate to="/customer/dashboard" replace />;
    } else if (user?.role === 'provider') {
      return <Navigate to="/provider/dashboard" replace />;
    } else if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

