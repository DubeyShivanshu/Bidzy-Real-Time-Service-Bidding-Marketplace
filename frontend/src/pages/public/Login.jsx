/**
 * Unified Login Page
 *
 * Responsibilities:
 *  - Role selector tabs: Customer | Provider | Admin
 *  - Customer: email/password & Google OAuth button
 *  - Provider: email/password only
 *  - Admin: email/password only (separate section)
 *  - On success: navigate to role's dashboard
 *  - Link to Register page
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

  // If we've a token in the URL, we are processing an OAuth login. Don't flash the login form.
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
        <div className="flex justify-center mb-6 items-center gap-2">
          <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-extrabold text-3xl shadow-lg shadow-green-200">
            B
          </div>
          <span className="text-4xl font-black tracking-tight text-gray-900">
            Bidzy<span className="text-green-600">.</span>
          </span>
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

