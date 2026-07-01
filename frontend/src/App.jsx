import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/auth/authStore.js';
import * as walletService from './services/wallet/wallet.service.js';
import { connectSocket, disconnectSocket, getSocket } from './utils/socket.js';
import PublicRoutes from './app/routes/PublicRoutes.jsx';
import CustomerRoutes from './app/routes/CustomerRoutes.jsx';
import ProviderRoutes from './app/routes/ProviderRoutes.jsx';
import AdminRoutes from './app/routes/AdminRoutes.jsx';
import ProtectedRoute from './app/routes/ProtectedRoute.jsx';
import Spinner from './components/common/Spinner.jsx';

const App = () => {
  const { token, isAuthenticated, updateUser } = useAuthStore();

  useEffect(() => {
    let socket;
    if (isAuthenticated && token) {
      socket = connectSocket(token);
      
      const handleWalletUpdate = async () => {
        try {
          const res = await walletService.getWallet();
          updateUser({ walletBalance: res.data.data.walletBalance });
        } catch (error) {
          console.error('Failed to auto-sync wallet:', error);
        }
      };

      // Instantly sync wallet balance on login/page-load to populate Navbar
      handleWalletUpdate();

      socket.on('wallet:update', handleWalletUpdate);
    } else {
      disconnectSocket();
    }
    
    return () => {
      if (socket) {
        socket.off('wallet:update');
      }
      disconnectSocket();
    };
  }, [isAuthenticated, token, updateUser]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
        <Routes>
          {/* Public routes */}
          <Route path="/*" element={<PublicRoutes />} />

          {/* Protected Customer routes */}
          <Route element={<ProtectedRoute allowedRole="customer" />}>
            <Route path="/customer/*" element={<CustomerRoutes />} />
          </Route>

          {/* Protected Provider routes */}
          <Route element={<ProtectedRoute allowedRole="provider" />}>
            <Route path="/provider/*" element={<ProviderRoutes />} />
          </Route>

          {/* Protected Admin routes */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin/*" element={<AdminRoutes />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
};

export default App;

