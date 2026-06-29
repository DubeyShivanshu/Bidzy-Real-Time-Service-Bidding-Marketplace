/**
 * components/auth/RegisterForm.jsx — Reusable Register Form
 *
 * Props: role ('customer'|'provider'), onSuccess
 * Fields: name, email, phone, city, speciality (provider), password
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Briefcase, Lock, Loader2 } from 'lucide-react';
import useAuthStore from '@store/auth/authStore.js';
import * as customerAuth from '@services/auth/customerAuth.service.js';
import * as providerAuth from '@services/auth/providerAuth.service.js';

export const RegisterForm = ({ role, onSuccess }) => {
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
        response = await customerAuth.register(data);
      } else {
        response = await providerAuth.register(data);
      }

      const { user, token } = response.data.data;
      setAuth(user, token);
      toast.success(response.data.message || 'Account registered successfully!');
      if (onSuccess) onSuccess(user);
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const specialities = [
    'Electrician',
    'Plumber',
    'AC Repair',
    'Cleaning',
    'Appliance Repair',
    'Carpentry',
    'Painter',
    'Barber',
    'RO Service',
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <User className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Your Full Name"
            {...register('name', { required: 'Name is required' })}
            className={`pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm ${
              errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
            }`}
          />
        </div>
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Phone className="h-5 w-5" />
            </span>
            <input
              type="tel"
              placeholder="9876543210"
              {...register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid Indian phone number' },
              })}
              className={`pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm ${
                errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <MapPin className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Bengaluru"
              {...register('city', { required: 'City is required' })}
              className={`pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm ${
                errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
          </div>
          {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
        </div>
      </div>

      {role === 'provider' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Briefcase className="h-5 w-5" />
            </span>
            <select
              {...register('speciality', { required: 'Speciality is required' })}
              className={`pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 sm:text-sm ${
                errors.speciality ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            >
              <option value="">Select speciality</option>
              {specialities.map((spec) => (
                <option key={spec} value={spec.toLowerCase()}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
          {errors.speciality && <p className="mt-1 text-xs text-red-600">{errors.speciality.message}</p>}
        </div>
      )}

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
          `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`
        )}
      </button>
    </form>
  );
};

export default RegisterForm;

