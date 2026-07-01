/**
 * Customer Route Definitions
 *
 * All routes require role=customer authentication (via ProtectedRoute).
 * Wrapped in CustomerLayout for consistent sidebar + navbar.
 *
 * Routes:
 *  /customer/dashboard    → CustomerDashboard.jsx
 *  /customer/post-job     → PostJob.jsx
 *  /customer/jobs/:id     → JobBidding.jsx (live bidding room)
 *  /customer/bookings     → CustomerBookings.jsx
 *  /customer/bookings/:id → BookingDetail.jsx (with chat)
 *  /customer/wallet       → CustomerWallet.jsx
 *  /customer/profile      → CustomerProfile.jsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '../../components/layout/CustomerLayout.jsx';
import CustomerDashboard from '../../pages/customer/CustomerDashboard.jsx';
import PostJob from '../../pages/customer/PostJob.jsx';
import JobBidding from '../../pages/customer/JobBidding.jsx';
import CustomerBookings from '../../pages/customer/CustomerBookings.jsx';
import CustomerWallet from '../../pages/customer/CustomerWallet.jsx';
import CustomerProfile from '../../pages/customer/CustomerProfile.jsx';
import BookingDetail from '../../pages/shared/BookingDetail.jsx';
import ProviderProfile from '../../pages/provider/ProviderProfile.jsx';
import DisputesList from '../../pages/shared/DisputesList.jsx';

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="post-job" element={<PostJob />} />
        <Route path="jobs/:id" element={<JobBidding />} />
        <Route path="bookings" element={<CustomerBookings />} />
        <Route path="bookings/:id" element={<BookingDetail />} />
        <Route path="wallet" element={<CustomerWallet />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="providers/:id" element={<ProviderProfile />} />
        <Route path="disputes" element={<DisputesList />} />
      </Route>
    </Routes>
  );
};

export default CustomerRoutes;

