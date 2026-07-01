import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as jobService from '../../services/jobs/job.service.js';
import useAuthStore from '../../store/auth/authStore.js';
import useBids from '../../features/bids/useBids.js';
import useSocket from '../../hooks/useSocket.js';
import CountdownTimer from '../../components/bidding/CountdownTimer.jsx';
import BidSubmitForm from '../../components/bidding/BidSubmitForm.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import toast from 'react-hot-toast';
import { MapPin, IndianRupee, AlertCircle, Clock, CheckCircle } from 'lucide-react';

export const ProviderBidding = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuthStore();
  const { bids, fetchBids, loading: bidsLoading } = useBids(id);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await jobService.getJobById(id);
        setJob(response.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
    fetchBids(); // Fetch competitor bids when the job loads
  }, [id]);

  // Listen for real-time acceptance or cancellation from WebSocket
  useEffect(() => {
    if (!socket || !id) return;

    const handleBidAccepted = ({ jobId, bidId, bookingId }) => {
      if (jobId === id) {
        const acceptedBid = bids.find((b) => b._id === bidId);
        if (acceptedBid && acceptedBid.providerId === user?._id) {
          toast.success('Congratulations! Your bid was accepted.', {
            duration: 5000,
          });
          setTimeout(() => {
            navigate(`/provider/bookings/${bookingId}`);
          }, 2000);
        } else {
          toast.error('Another provider’s bid was accepted. Job closed.');
          setTimeout(() => {
            navigate('/provider/dashboard');
          }, 2000);
        }
      }
    };

    const handleJobCancelled = ({ jobId }) => {
      if (jobId === id) {
        toast.error('This job has been cancelled by the customer.');
        navigate('/provider/dashboard');
      }
    };

    const handleBidRejected = ({ jobId, providerId }) => {
      if (jobId === id && providerId === user?._id) {
        toast.error('The customer declined your bid.');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    };

    socket.on('bid:accepted', handleBidAccepted);
    socket.on('job:cancelled', handleJobCancelled);
    socket.on('bid:rejected', handleBidRejected);

    return () => {
      socket.off('bid:accepted', handleBidAccepted);
      socket.off('job:cancelled', handleJobCancelled);
      socket.off('bid:rejected', handleBidRejected);
    };
  }, [socket, id, bids, user, navigate]);

  const handleBidSuccess = () => {
    toast.success('Bid placed successfully!');
    fetchBids(); // Refresh bid list to show own bid
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Error Loading Job</h3>
        <p className="text-sm text-gray-500 mt-1">{error || 'Job not found.'}</p>
        <button
          onClick={() => navigate('/provider/dashboard')}
          className="mt-5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg text-sm transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Check if current provider has already placed a bid
  const myBid = bids.find((b) => b.providerId === user?._id);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Job Details (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start flex-wrap gap-4">
              <div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 capitalize">
                  {job.service}
                </span>
                <h1 className="text-2xl font-black text-gray-900 mt-2 tracking-tight">Job details</h1>
              </div>
              <CountdownTimer expiresAt={job.expiresAt} />
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Description</h3>
                <p className="text-sm text-gray-800 mt-1 leading-relaxed">{job.description}</p>
              </div>

              {job.address && (
                <div className="flex items-start gap-1.5 text-xs text-gray-500 pt-2">
                  <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                  <span>{job.address.full || `${job.address.city}, ${job.address.pincode}`}</span>
                </div>
              )}

              {job.imageUrl && (() => {
                const isCloudinary = job.imageUrl.startsWith('http');
                const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
                const cleanPath = job.imageUrl.replace(/\\/g, '/').replace(/^\/+/, '');
                const fullUrl = isCloudinary ? job.imageUrl : `${baseUrl}/${cleanPath}`;
                
                return (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Reference Image</h3>
                    <div className="rounded-xl overflow-hidden border border-gray-200 w-full md:w-2/3 lg:w-1/2 relative group">
                      <img src={fullUrl} alt="Job reference" className="w-full h-auto object-cover" />
                      <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm">
                        View Full Image
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Max Budget</span>
                <div className="flex items-center text-green-600 mt-1">
                  <IndianRupee className="h-5 w-5" />
                  <span className="text-2xl font-black">{job.budget}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Urgency</span>
                <div className="flex items-center gap-1.5 text-gray-700 mt-2.5 font-bold text-sm uppercase">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{job.urgency}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Bid Form / Submission State (1/3 width) */}
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Proposal</h2>

            {myBid ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <h4 className="font-bold text-green-950">Proposal Submitted!</h4>
                <p className="text-xs text-green-700 mt-1">
                  You placed a bid of <strong className="text-sm font-black">₹{myBid.price}</strong> with an ETA of{' '}
                  <strong>{myBid.eta} mins</strong>.
                </p>
                <div className="mt-4 pt-4 border-t border-green-150 flex justify-between items-center text-xs text-gray-500 font-semibold uppercase tracking-wider">
                  <span>Status:</span>
                  <span className="text-green-700 font-bold">{myBid.status}</span>
                </div>
              </div>
            ) : (
              <BidSubmitForm jobId={id} onSuccess={handleBidSuccess} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderBidding;
