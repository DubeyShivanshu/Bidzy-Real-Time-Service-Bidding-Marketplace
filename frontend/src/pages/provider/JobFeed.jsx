import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useJobs from '../../features/jobs/useJobs.js';
import useGeolocation from '../../hooks/useGeolocation.js';
import useSocket from '../../hooks/useSocket.js';
import useJobStore from '../../store/jobs/jobStore.js';
import Spinner from '../../components/common/Spinner.jsx';
import CountdownTimer from '../../components/bidding/CountdownTimer.jsx';
import { MapPin, IndianRupee, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const JobFeed = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { coords, requestLocation, loading: geoLoading } = useGeolocation();
  const { jobs, fetchOpenJobs, loading: jobsLoading } = useJobs();
  const { addJob } = useJobStore();

  const [categoryFilter, setCategoryFilter] = useState('');

  // Fetch coordinates on mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Fetch jobs once coordinates are resolved
  useEffect(() => {
    if (coords) {
      fetchOpenJobs({
        lng: coords.lng,
        lat: coords.lat,
        service: categoryFilter || undefined,
      });
    } else if (!geoLoading) {
      fetchOpenJobs({
        service: categoryFilter || undefined,
      });
    }
  }, [coords, categoryFilter]);

  // Live incoming job listener via WebSockets
  useEffect(() => {
    if (!socket) return;

    const handleNewJob = (newJob) => {
      if (!categoryFilter || newJob.service.toLowerCase() === categoryFilter.toLowerCase()) {
        addJob(newJob);
        toast('New job request posted nearby!', {
          icon: '🔔',
          duration: 4000,
        });
      }
    };

    socket.on('job:new', handleNewJob);

    return () => {
      socket.off('job:new', handleNewJob);
    };
  }, [socket, categoryFilter, addJob]);

  const handleRefresh = () => {
    fetchOpenJobs({
      lng: coords?.lng,
      lat: coords?.lat,
      service: categoryFilter || undefined,
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Available Jobs Feed</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time feed showing open service requests within your service area.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-white p-4 border border-gray-200 rounded-xl mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-gray-700">Filter Specialty:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-1.5 px-3 border border-gray-300 rounded-lg text-sm bg-white font-semibold text-gray-800"
          >
            <option value="">All Services</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Carpenter">Carpenter</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Appliance Repair">Appliance Repair</option>
          </select>
        </div>

        {coords && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-150">
            <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-ping"></span>
            <span>Location tracking enabled</span>
          </div>
        )}
      </div>

      {/* Loading state */}
      {jobsLoading && jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="mt-4 text-sm text-gray-500 font-semibold">Searching for service requests nearby...</p>
        </div>
      ) : jobs.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No Jobs Found Nearby</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
            We couldn't find any active service requests in your area. Make sure your browser location is enabled or try changing category filter.
          </p>
        </div>
      ) : (
        /* Grid list */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div
              key={job._id}
              onClick={() => navigate(`/provider/jobs/${job._id}`)}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:border-green-500 hover:shadow-md transition duration-150 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 capitalize">
                    {job.service}
                  </span>
                  <CountdownTimer expiresAt={job.expiresAt} />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mt-3">{job.customerId?.name || 'Customer'}</h3>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3 font-medium">{job.description}</p>
                {job.imageUrl && (
                  <div className="mt-3 relative w-full h-32 rounded-lg overflow-hidden border border-gray-100">
                    <img src={job.imageUrl} alt="Job reference" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center text-sm font-semibold">
                <div className="flex items-center gap-1 text-green-600">
                  <IndianRupee className="h-4 w-4" />
                  <span className="text-lg font-black">₹{job.budget}</span>
                  <span className="text-xs text-gray-400 font-semibold ml-0.5">Budget</span>
                </div>

                <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold uppercase tracking-wide">
                  <Clock className="h-4 w-4" />
                  <span>{job.urgency} urgency</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobFeed;
