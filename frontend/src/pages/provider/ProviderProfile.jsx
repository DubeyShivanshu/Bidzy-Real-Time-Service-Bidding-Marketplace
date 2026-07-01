/**
 * Provider Public Profile
 *
 * Responsibilities:
 *  - Display name, speciality, city, rating, totalReviews
 *  - Verified badge if verified
 *  - Review list
 *  - Edit profile link (if viewing own profile)
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Star, AlertCircle, Edit2, Briefcase, Phone, Save, X, Camera, Trash2 } from 'lucide-react';
import * as providerService from '../../services/providers/provider.service.js';
import * as providerAuthService from '../../services/auth/providerAuth.service.js';
import useAuthStore from '../../store/auth/authStore.js';
import toast from 'react-hot-toast';
import Spinner from '../../components/common/Spinner.jsx';
import ReviewCard from '../../components/booking/ReviewCard.jsx';
import * as avatarService from '../../services/auth/avatar.service.js';

const ProviderProfile = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // If no ID is provided in URL, assume viewing own profile (requires auth)
  const targetId = id || user?._id;
  const isOwnProfile = user?._id === targetId;
  const { updateUser } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    speciality: '',
    bio: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    if (!targetId) {
      setError('Provider ID not found.');
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await providerService.getProviderProfile(targetId);
        const p = res.data.data.provider;
        setProvider(p);
        setReviews(res.data.data.reviews || []);
        if (isOwnProfile) {
          setFormData({
            name: p.name || '',
            phone: p.phone || '',
            city: p.city || '',
            speciality: p.speciality || '',
            bio: p.bio || '',
          });
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [targetId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white border border-gray-200 rounded-xl text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Profile Error</h3>
        <p className="text-sm text-gray-500 mt-1">{error || 'Provider not found'}</p>
      </div>
    );
  }

  // Initials for Avatar
  const initials = provider.name
    ? provider.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      const res = await providerAuthService.updateProfile(formData);
      updateUser(res.data.data.user);
      setProvider(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const res = await avatarService.uploadAvatar('provider', file);
      updateUser(res.data.data.user);
      setProvider(prev => ({ ...prev, avatar: res.data.data.user.avatar }));
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
      const res = await avatarService.deleteAvatar('provider');
      updateUser(res.data.data.user);
      setProvider(prev => ({ ...prev, avatar: null }));
      toast.success('Profile picture removed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove image');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-8 font-sans">
      
      {/* ── Header / Identity Card ── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-green-50 rounded-full opacity-50 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          
          {/* Avatar */}
          <div className="relative group flex-shrink-0">
            <div className={`h-24 w-24 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-md overflow-hidden ${avatarLoading ? 'opacity-50' : ''}`}>
              {provider.avatar ? (
                <img src={provider.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-white">{initials}</span>
              )}
            </div>

            {isOwnProfile && (
              <>
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

                {provider.avatar && (
                  <button 
                    onClick={handleAvatarDelete}
                    disabled={avatarLoading}
                    className="absolute -bottom-2 -right-2 p-1.5 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg shadow-sm transition"
                    title="Remove Picture"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight truncate">
                {provider.name}
              </h1>
              {provider.verified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  Verified Provider
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3">
              {provider.speciality && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span className="capitalize">{provider.speciality}</span>
                </div>
              )}
              {provider.city && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {provider.city}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <span className="text-lg font-black text-gray-900">
                  {provider.rating?.toFixed(1) || '5.0'}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-400">
                ({provider.totalReviews || 0} reviews)
              </span>
            </div>
            {isOwnProfile && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold hover:bg-gray-50 transition text-gray-600"
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Speciality</label>
              <select value={formData.speciality} onChange={(e) => setFormData({...formData, speciality: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Appliance Repair">Appliance Repair</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio</label>
              <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Tell customers about your experience..." />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saveLoading} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-sm disabled:opacity-50">
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-600">
            {provider.bio ? (
              <p className="leading-relaxed whitespace-pre-wrap">{provider.bio}</p>
            ) : (
              <p className="italic text-gray-400">No bio provided.</p>
            )}
            {provider.phone && (
              <div className="flex items-center gap-2 mt-4 text-gray-500 font-semibold">
                <Phone className="h-4 w-4" /> {provider.phone}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Reviews Section ── */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
          Recent Reviews
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 border border-gray-100 rounded-2xl">
            <Star className="h-10 w-10 text-gray-300 fill-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">No reviews yet.</p>
            <p className="text-xs text-gray-400 mt-1">Complete bookings to start receiving customer feedback.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ProviderProfile;

