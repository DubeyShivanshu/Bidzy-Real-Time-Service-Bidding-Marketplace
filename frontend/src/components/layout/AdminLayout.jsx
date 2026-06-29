/**
 * components/layout/AdminLayout.jsx — Admin App Shell
 *
 * Responsibilities:
 *  - Navbar with admin nav items
 *  - Render <Outlet /> for child routes
 */
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
