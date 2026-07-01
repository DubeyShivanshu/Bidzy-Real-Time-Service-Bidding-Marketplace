import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useGeolocation from '../../hooks/useGeolocation.js';
import useJobMap from '../../features/jobs/useJobMap.js';
import * as jobService from '../../services/jobs/job.service.js';
import toast from 'react-hot-toast';

// default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to handle map clicks and sync position
function MapEventsHandler({ position, setPosition, onLocationSelected }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelected(lat, lng);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, 14);
    }
  }, [position, map]);

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const coords = marker.getLatLng();
          setPosition([coords.lat, coords.lng]);
          onLocationSelected(coords.lat, coords.lng);
        },
      }}
    />
  ) : null;
}

export const PostJob = () => {
  const navigate = useNavigate();
  const { coords, error: geoError, loading: geoLoading, requestLocation } = useGeolocation();
  const { address, handleMarkerDragEnd, loading: geocodeLoading } = useJobMap();

  const [position, setPosition] = useState(null); // [lat, lng]
  const categories = [
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

  const [service, setService] = useState(categories[0].toLowerCase());
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [urgency, setUrgency] = useState('today');
  const [scheduledDate, setScheduledDate] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Address subfields state
  const [fullAddress, setFullAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Request user geolocation on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Set position when browser geolocation succeeds
  useEffect(() => {
    if (coords) {
      const latlng = [coords.lat, coords.lng];
      setPosition(latlng);
      handleLocationChange(coords.lat, coords.lng);
    }
  }, [coords]);

  // Populate address inputs when reverse geocoding finishes
  useEffect(() => {
    if (address) {
      setFullAddress(address.full || '');
      setCity(address.city || '');
      setStateName(address.state || '');
      setPincode(address.pincode || '');
    }
  }, [address]);

  const handleLocationChange = async (lat, lng) => {
    await handleMarkerDragEnd(lat, lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      toast.error('Please select a location on the map.');
      return;
    }
    if (!description || !budget || !city || !pincode) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('service', service);
      formData.append('description', description);
      formData.append('budget', budget);
      formData.append('urgency', urgency);
      if (urgency === 'scheduled' && scheduledDate) {
        formData.append('scheduledDate', scheduledDate);
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }
      formData.append('address', JSON.stringify({
        full: fullAddress,
        city,
        state: stateName,
        pincode,
      }));
      formData.append('location', JSON.stringify({
        type: 'Point',
        coordinates: [position[1], position[0]],
      }));

      const response = await jobService.createJob(formData);
      toast.success('Job posted successfully!');
      const newJob = response.data.data;
      navigate(`/customer/jobs/${newJob._id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to post job.');
    } finally {
      setSubmitting(false);
    }
  };

  const defaultCenter = [28.6139, 77.2090]; // Delhi

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Post a New Job</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tell us what needs fixing and get live bids from nearby verified professionals.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side form fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Service Category
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-semibold text-gray-900 capitalize"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat.toLowerCase()}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Describe what you need help with
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="block w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900"
                  placeholder="e.g. Toilet tank leaking water on floor. Need replacement gasket."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="block w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-semibold text-gray-900"
                    placeholder="e.g. 500"
                    min="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value)}
                    className="block w-full py-2.5 px-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-semibold text-gray-900 capitalize"
                  >
                    <option value="immediate">Immediate (Next 1 hour)</option>
                    <option value="today">Today</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              {urgency === 'scheduled' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Select Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="block w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Upload Image (Optional, max 8MB)
                </label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file && file.size > 8 * 1024 * 1024) {
                      toast.error('Image must be less than 8MB');
                      e.target.value = '';
                      setImageFile(null);
                    } else {
                      setImageFile(file);
                    }
                  }}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                <p className="text-xs text-gray-500 mt-1">Upload a clear photo of the issue to help providers.</p>
              </div>
            </div>

            {/* Right side Location Picker Map */}
            <div className="flex flex-col space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Select Job Location on Map
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Click or drag the marker to pin the exact service location.
                </p>
                <div className="h-64 rounded-xl border border-gray-200 overflow-hidden relative z-10">
                  <MapContainer
                    center={position || defaultCenter}
                    zoom={position ? 18 : 5}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapEventsHandler
                      position={position}
                      setPosition={setPosition}
                      onLocationSelected={handleLocationChange}
                    />
                  </MapContainer>
                </div>
              </div>

              {/* Autocomplete Address Fields */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">
                    Resolved Address
                  </label>
                  <input
                    type="text"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="block w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 focus:outline-none"
                    placeholder={geocodeLoading ? 'Resolving coordinates...' : 'Address description...'}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-semibold text-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-semibold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 tracking-wider uppercase mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="block w-full py-2 px-3 border border-gray-300 rounded-lg text-xs font-semibold text-gray-900"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-1/2 mx-auto flex justify-center items-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-black text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
          >
            {submitting ? 'Creating Service Request...' : 'Post Job'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostJob;
