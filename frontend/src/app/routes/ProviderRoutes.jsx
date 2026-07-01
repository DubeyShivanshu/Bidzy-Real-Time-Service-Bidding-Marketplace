/**
 * Provider Route Definitions
 *
 * All routes require role=provider authentication (via ProtectedRoute).
 * Wrapped in ProviderLayout for consistent sidebar + navbar.
 *
 * Routes:
 *  /provider/dashboard       → ProviderDashboard.jsx (real-time job feed)
 *  /provider/jobs            → JobFeed.jsx (browse open jobs)
 *  /provider/jobs/:id        → ProviderBidding.jsx (bid submission)
 *  /provider/bookings        → ProviderBookings.jsx
 *  /provider/bookings/:id    → BookingDetail.jsx (with chat)
 *  /provider/profile         → ProviderProfile.jsx
 *  /provider/verification    → VerificationUpload.jsx
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProviderLayout from '../../components/layout/ProviderLayout.jsx';
import ProviderDashboard from '../../pages/provider/ProviderDashboard.jsx';
import ProviderWallet from '../../pages/provider/ProviderWallet.jsx';
import JobFeed from '../../pages/provider/JobFeed.jsx';
import ProviderBidding from '../../pages/provider/ProviderBidding.jsx';
import ProviderBookings from '../../pages/provider/ProviderBookings.jsx';
import BookingDetail from '../../pages/shared/BookingDetail.jsx';
import ProviderProfile from '../../pages/provider/ProviderProfile.jsx';
import VerificationUpload from '../../pages/provider/VerificationUpload.jsx';
import DisputesList from '../../pages/shared/DisputesList.jsx';

const ProviderRoutes = () => {
  return (
    <Routes>
      <Route element={<ProviderLayout />}>
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="wallet" element={<ProviderWallet />} />
        <Route path="jobs" element={<JobFeed />} />
        <Route path="jobs/:id" element={<ProviderBidding />} />
        <Route path="bookings" element={<ProviderBookings />} />
        <Route path="bookings/:id" element={<BookingDetail />} />
        <Route path="profile" element={<ProviderProfile />} />
        <Route path="verification" element={<VerificationUpload />} />
        <Route path="disputes" element={<DisputesList />} />
      </Route>
    </Routes>
  );
};

export default ProviderRoutes;

