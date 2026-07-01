/**
 * Reusable Login Form
 *
 * Props: role ('customer'|'provider'|'admin'), onSuccess
 * Uses React Hook Form, calls appropriate auth service
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Mail, Lock, Loader2 } from 'lucide-react';
import useAuthStore from '@store/auth/authStore.js';
import * as customerAuth from '@services/auth/customerAuth.service.js';
import * as providerAuth from '@services/auth/providerAuth.service.js';
import * as adminAuth from '@services/auth/adminAuth.service.js';

export const LoginForm = ({ role, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let response;
      if (role === 'customer') {
        response = await customerAuth.login(data);
      } else if (role === 'provider') {
        response = await providerAuth.login(data);
      } else {
        response = await adminAuth.login(data);
      }

      const { user, token } = response.data.data;
      setAuth(user, token);
      toast.success(response.data.message || 'Logged in successfully!');
      if (onSuccess) onSuccess(user);
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <Mail className="h-5 w-5" />
          </span>
          <input
            type="email"
            placeholder="you@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
            })}
            className={`pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm ${
              errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
          />
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <Lock className="h-5 w-5" />
          </span>
          <input
            type="password"
            placeholder="••••••••"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
            className={`pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm ${
              errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
          />
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`
        )}
      </button>
    </form>
  );
};

export default LoginForm;

