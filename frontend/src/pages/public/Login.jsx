/**
 * pages/public/Login.jsx — Unified Login Page
 *
 * Responsibilities:
 *  - Role selector tabs: Customer | Provider | Admin
 *  - Customer: email/password + Google OAuth button
 *  - Provider: email/password only
 *  - Admin: email/password only (separate section)
 *  - On success: navigate to role's dashboard
 *  - Link to Register page
 *
 * Design: Trove-inspired — clean card layout, Inter font, green accent
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import LoginForm from '../../components/auth/LoginForm.jsx';
import GoogleOAuthButton from '../../components/auth/GoogleOAuthButton.jsx';
import RoleSelector from '../../components/auth/RoleSelector.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import useAuthStore from '@store/auth/authStore.js';

const Login = () => {
  const [role, setRole] = useState('customer');
  const { isAuthenticated, user, setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const oauthHandled = useRef(false);

  // Parse Google OAuth redirect tokens on mount
  useEffect(() => {
    if (oauthHandled.current) return;

    const token = searchParams.get('token');
    const userDataStr = searchParams.get('user');
    const error = searchParams.get('error');

    if (error) {
      oauthHandled.current = true;
      toast.error('Google authentication failed. Please try again.');
    } else if (token && userDataStr) {
      oauthHandled.current = true;
      try {
        const parsedUser = JSON.parse(userDataStr);
        setAuth(parsedUser, token);
        toast.success(`Welcome back, ${parsedUser.name}!`);
        navigate('/customer/dashboard', { replace: true });
      } catch (err) {
        console.error('Failed to parse Google OAuth user', err);
        toast.error('Authentication parsing error.');
      }
    }
  }, [searchParams, setAuth, navigate]);

  // Redirect to correct dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSuccess = (loggedInUser) => {
    navigate(`/${loggedInUser.role}/dashboard`, { replace: true });
  };

  // If we have a token in the URL, we are processing an OAuth login. Don't flash the login form.
  if (searchParams.get('token')) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-500 font-medium">Authenticating with Google...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="flex justify-center mb-6 items-center">
          <div className="bg-green-600 text-white p-2 rounded-xl flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 9 4.9V17L12 22l-9-4.9V7z"/><path d="m12 22 9-4.9"/><path d="M12 22v-9.5"/><path d="m12 12.5 9-4.9"/><path d="m12 12.5-9-4.9"/></svg>
          </div>
          <span className="ml-3 text-4xl font-black tracking-tight text-gray-900">Bidzy</span>
        </div>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-200">
          <h2 className="text-center text-2xl font-extrabold text-gray-900 tracking-tight mb-6">
            Sign in to your account
          </h2>
          <RoleSelector
            selectedRole={role}
            onChange={(selected) => setRole(selected)}
            roles={['customer', 'provider', 'admin']}
          />

          <LoginForm role={role} onSuccess={handleSuccess} />

          {role === 'customer' && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleOAuthButton />
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-600 font-medium">
          New to Bidzy?{' '}
          <Link to="/register" className="font-bold text-green-600 hover:text-green-700 transition duration-150">
            Create a new account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

