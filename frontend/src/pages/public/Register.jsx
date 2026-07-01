/**
 * Unified Register Page
 *
 * Responsibilities:
 *  - Role selector: Customer | Provider
 *  - Customer: name, email, phone, city, password + Google OAuth option
 *  - Provider: name, email, phone, city, speciality, password
 *  - Admin registration NOT available publicly
 *  - Form validation via React Hook Form
 *  - On success: auto-login and navigate to dashboard
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RegisterForm from '../../components/auth/RegisterForm.jsx';
import GoogleOAuthButton from '../../components/auth/GoogleOAuthButton.jsx';
import RoleSelector from '../../components/auth/RoleSelector.jsx';
import useAuthStore from '@store/auth/authStore.js';

const Register = () => {
  const [role, setRole] = useState('customer');
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect to correct dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSuccess = (registeredUser) => {
    navigate(`/${registeredUser.role}/dashboard`, { replace: true });
  };

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
            Create a new account
          </h2>
          <RoleSelector
            selectedRole={role}
            onChange={(selected) => setRole(selected)}
            roles={['customer', 'provider']}
          />

          <RegisterForm role={role} onSuccess={handleSuccess} />

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
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-green-600 hover:text-green-700 transition duration-150">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

