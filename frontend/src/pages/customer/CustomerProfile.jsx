/**
 * pages/customer/CustomerProfile.jsx
 */

import React, { useState } from 'react';
import useAuthStore from '../../store/auth/authStore.js';
import * as customerAuthService from '../../services/auth/customerAuth.service.js';
import * as avatarService from '../../services/auth/avatar.service.js';
import toast from 'react-hot-toast';
import { User, Mail, MapPin, Phone, Edit2, Save, X, Camera, Trash2 } from 'lucide-react';

const CustomerProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  if (!user) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await customerAuthService.updateProfile(formData);
      updateUser(res.data.data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const res = await avatarService.uploadAvatar('customer', file);
      updateUser(res.data.data.user);
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    
    setAvatarLoading(true);
    try {
      const res = await avatarService.deleteAvatar('customer');
      updateUser(res.data.data.user);
      toast.success('Profile picture removed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove image');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="bg-green-600 h-32"></div>
        <div className="px-8 pb-8">
          <div className="-mt-12 mb-6 flex items-end gap-4">
            <div className="relative group">
              <div className={`h-24 w-24 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 flex items-center justify-center text-green-700 font-black text-4xl overflow-hidden ${avatarLoading ? 'opacity-50' : ''}`}>
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              
              {/* Hover Overlay */}
              <div 
                className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-6 w-6 text-white mb-1" />
                <span className="text-[10px] text-white font-bold">Change</span>
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {user?.avatar && (
              <button 
                onClick={handleAvatarDelete}
                disabled={avatarLoading}
                className="mb-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                title="Remove Picture"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-gray-900">{user.name}</h1>
              <p className="text-sm font-bold text-green-600 uppercase tracking-wider mb-6">Customer Account</p>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition"
              >
                <Edit2 className="h-4 w-4" /> Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="E.g., 9876543210"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="E.g., Mumbai"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition flex items-center gap-2 text-sm"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
                >
                  <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Email</p>
                  <p className="font-semibold text-gray-900">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Phone</p>
                  <p className="font-semibold text-gray-900">{user.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">City</p>
                  <p className="font-semibold text-gray-900">{user.city || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Member Since</p>
                  <p className="font-semibold text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
