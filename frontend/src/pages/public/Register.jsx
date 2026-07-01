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

