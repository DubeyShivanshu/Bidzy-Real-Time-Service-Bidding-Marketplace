/**
 * components/layout/Navbar.jsx — Top Navigation Bar
 *
 * Responsibilities:
 *  - Display Bidzy logo/brand
 *  - Role-aware navigation links
 *  - User avatar + dropdown (profile, logout)
 *  - Wallet balance chip (customer only)
 */

import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/auth/authStore.js';
import { Wallet, LogOut, User, Menu, X, PlusCircle, CheckSquare, Briefcase, ShieldCheck, Gavel, Activity, Users, Calendar, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  // Define links based on roles
  const customerLinks = [
    { label: 'Dashboard', path: '/customer/dashboard', icon: Briefcase },
    { label: 'My Bookings', path: '/customer/bookings', icon: CheckSquare },
    { label: 'Post a Job', path: '/customer/post-job', icon: PlusCircle },
    { label: 'Wallet', path: '/customer/wallet', icon: Wallet },
    { label: 'Profile', path: '/customer/profile', icon: User },
    { label: 'Disputes', path: '/customer/disputes', icon: Gavel },
  ];

  const providerLinks = [
    { label: 'Dashboard', path: '/provider/dashboard', icon: Briefcase },
    { label: 'Bookings', path: '/provider/bookings', icon: CheckSquare },
    { label: 'Open Jobs', path: '/provider/jobs', icon: PlusCircle },
    { label: 'Profile', path: '/provider/profile', icon: User },
    { label: 'Wallet', path: '/provider/wallet', icon: Wallet },
    { label: 'Verification', path: '/provider/verification', icon: ShieldCheck },
    { label: 'Disputes', path: '/provider/disputes', icon: Gavel },
  ];

  const adminLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: Activity },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Providers', path: '/admin/providers', icon: ShieldCheck },
    { label: 'Wallet', path: '/admin/wallet', icon: Wallet },
    { label: 'Bookings', path: '/admin/bookings', icon: Calendar },
    { label: 'Disputes', path: '/admin/disputes', icon: Gavel },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const links = 
    user?.role === 'admin' ? adminLinks :
    user?.role === 'customer' ? customerLinks : 
    providerLinks;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/${user?.role}/dashboard`)}>
              <div className="h-9 w-9 bg-green-600 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
                B
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                Bidzy<span className="text-green-600">.</span>
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:ml-8 lg:flex lg:space-x-4 items-center">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-xl text-sm font-bold transition flex items-center gap-1.5 ${
                    isActive(link.path)
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet chip for Customer & Provider & Admin */}
          <div className="hidden lg:flex lg:items-center lg:gap-4">
            {(user?.role === 'customer' || user?.role === 'provider' || user?.role === 'admin') && (
              <Link
                to={`/${user?.role}/wallet`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl border border-green-200 text-xs font-bold transition"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>₹{user?.walletBalance?.toLocaleString('en-IN') || '0'}</span>
              </Link>
            )}

            {/* User Profile Info & Logout */}
            <div className="flex items-center gap-3 border-l border-gray-150 pl-4">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shadow-sm border border-gray-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-black text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-right mr-1">
                <p className="text-xs font-bold text-gray-950">{user?.name}</p>
                <p className="text-[10px] text-gray-400 font-semibold capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile hamburger menu button */}
          <div className="-mr-2 flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-gray-250 bg-white">
          <div className="pt-2 pb-3 space-y-1 px-4">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-bold ${
                  isActive(link.path)
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
            
            {(user?.role === 'customer' || user?.role === 'provider' || user?.role === 'admin') && (
              <Link
                to={`/${user?.role}/wallet`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 border-t border-gray-100 mt-2 pt-2"
              >
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  <span>Wallet Balance</span>
                </div>
                <span className="text-green-700">₹{user?.walletBalance?.toLocaleString('en-IN') || '0'}</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-bold text-red-600 hover:bg-red-50 border-t border-gray-100 mt-2 pt-2"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
