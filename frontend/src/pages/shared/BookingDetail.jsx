import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as bookingService from '../../services/bookings/booking.service.js';
import useAuthStore from '../../store/auth/authStore.js';
import useSocket from '../../hooks/useSocket.js';
import ChatWindow from '../../components/chat/ChatWindow.jsx';
import ReviewForm from '../../components/booking/ReviewForm.jsx';
import DisputeForm from '../../components/booking/DisputeForm.jsx';
import DisputeStatusCard from '../../components/booking/DisputeStatusCard.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import toast from 'react-hot-toast';
import * as disputeService from '../../services/disputes/dispute.service.js';
import {
  MapPin, CheckCircle, XCircle, Clock,
  Star, AlertCircle, Gavel, Shield, Receipt
} from 'lucide-react';

const STATUS_BADGE = {
  active: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const BookingDetail = () => {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dispute, setDispute] = useState(null);

  const isCustomer = user?.role === 'customer';

  // Fetch booking details on mount (moved inside effect)
  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await bookingService.getBookingById(bookingId);
        setBooking(res.data.data);

        try {
          const disputeRes = await disputeService.getDisputeByBookingId(bookingId);
          setDispute(disputeRes.data.data);
        } catch (dErr) {
          if (dErr.response?.status !== 404) {
            console.error('Failed to load dispute status:', dErr);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  // Real-time listener for booking status changes
  const socket = useSocket();
  useEffect(() => {
    if (!socket || !bookingId) return;

    const handleBookingUpdate = (data) => {
      if (data.bookingId === bookingId && data.status) {
        setBooking((prev) => prev ? { ...prev, status: data.status } : null);
        if (data.status === 'completed') {
          toast.success('This booking has been marked as complete!');
        } else if (data.status === 'cancelled') {
          toast.error('This booking has been cancelled.');
        }
      }
    };

    socket.on('booking:updated', handleBookingUpdate);
    return () => socket.off('booking:updated', handleBookingUpdate);
  }, [socket, bookingId]);

  const handleComplete = async () => {
    if (!window.confirm('Mark this booking as complete? This will release payment to the provider.')) return;
    setActionLoading(true);
    try {
      const res = await bookingService.completeBooking(bookingId);
      setBooking(res.data.data);
      toast.success('Booking completed! Payment has been released to the provider.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete booking.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking? A refund will be applied based on our cancellation policy.')) return;
    setActionLoading(true);
    try {
      const res = await bookingService.cancelBooking(bookingId);
      setBooking(res.data.data.booking);
      const { refundPercent, refundAmount } = res.data.data;
      toast.success(`Booking cancelled. ₹${refundAmount} (${refundPercent}%) refunded to your wallet.`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setActionLoading(false);
    }
  };

  // Refresh provider rating shown in UI after review submission
  const handleReviewSubmitted = (review) => {
    setBooking((prev) => ({
      ...prev,
      providerId: {
        ...prev.providerId,
        rating: review.rating,
        totalReviews: (prev.providerId?.totalReviews || 0) + 1,
      },
    }));
  };

  if (loading) return <div className="flex h-64 items-center justify-center"><Spinner size="lg" /></div>;

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white border border-gray-200 rounded-xl text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900">Error</h3>
        <p className="text-sm text-gray-500 mt-1">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg text-sm"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { jobId: job, bidId: bid, customerId: customer, providerId: provider } = booking;
  const addr = job?.address;

  // Determine the other participant's display name
  const counterpartyName = isCustomer ? provider?.name : customer?.name;
  const isBookingClosed = booking.status !== 'active';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 font-sans">
      {/* Status Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${STATUS_BADGE[booking.status] || STATUS_BADGE.active} capitalize`}>
              {booking.status === 'active' && <Clock className="h-3.5 w-3.5" />}
              {booking.status === 'completed' && <CheckCircle className="h-3.5 w-3.5" />}
              {booking.status === 'cancelled' && <XCircle className="h-3.5 w-3.5" />}
              {booking.status}
            </span>
            <h1 className="text-2xl font-black text-gray-900 mt-2 tracking-tight capitalize">
              {job?.service} Service Booking
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Booking ID: {booking._id}
            </p>
          </div>

          {/* Actions — Customer Only, Active Bookings */}
          {isCustomer && booking.status === 'active' && (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-sm transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition shadow-sm disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Mark as Complete'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (cols 1 & 2) — Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-4">Service Details</h2>
            <p className="text-sm text-gray-800 leading-relaxed">{job?.description}</p>
            {addr && (
              <div className="flex items-center gap-1.5 mt-4 text-xs text-gray-500 font-semibold">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{addr.full || `${addr.city}, ${addr.pincode}`}</span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-2.5 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full capitalize">
                {job?.service}
              </span>
              <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 text-gray-600 text-xs font-bold rounded-full capitalize">
                {job?.urgency} urgency
              </span>
            </div>
            {job?.imageUrl && (
              <div className="mt-5 rounded-xl overflow-hidden border border-gray-200 w-full md:w-2/3 lg:w-1/2 relative group">
                <img src={job.imageUrl} alt="Job reference" className="w-full h-auto object-cover" />
                <a href={job.imageUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-sm">
                  View Full Image
                </a>
              </div>
            )}
          </div>

          {/* People & Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {customer && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer</p>
                  <p className="font-bold text-gray-900">{customer.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{customer.city || '—'}</p>
                  {customer.phone && (
                    <p className="text-sm font-semibold text-gray-600 mt-2">
                      📞 {customer.phone}
                    </p>
                  )}
                </div>
              )}
              {provider && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Service Provider</p>
                  {isCustomer && provider._id ? (
                    <Link 
                      to={`/customer/providers/${provider._id}`}
                      className="font-bold text-gray-900 hover:text-green-600 transition"
                    >
                      {provider.name}
                    </Link>
                  ) : (
                    <p className="font-bold text-gray-900">{provider.name}</p>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-semibold text-gray-600">
                      {provider.rating?.toFixed(1) || '5.0'} ({provider.totalReviews || 0} reviews)
                    </span>
                  </div>
                  {provider.phone && (
                    <p className="text-sm font-semibold text-gray-600 mt-2">
                      📞 {provider.phone}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-400 tracking-wider uppercase mb-4 flex items-center gap-1.5">
                  <Receipt className="h-4 w-4" />
                  Payment Breakdown
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <Gavel className="h-4 w-4 text-gray-400" /> Bid Amount
                    </span>
                    <span className="font-bold text-gray-900">₹{booking.basePrice}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-gray-400" /> Security Deposit
                    </span>
                    <span className="font-bold text-gray-900">₹{booking.securityDeposit}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-550 text-xs">Platform Fee (5%)</span>
                    <span className="font-semibold text-gray-600">₹{booking.platformFee}</span>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-1 flex justify-between items-center">
                    <span className="text-sm font-black text-gray-900">Total Charged</span>
                    <span className="text-xl font-black text-gray-900">₹{booking.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 font-semibold">
                <span>Escrow Status</span>
                <span className={`capitalize font-bold ${
                  booking.escrowStatus === 'released' ? 'text-green-600' :
                  booking.escrowStatus === 'refunded' ? 'text-blue-600' : 'text-amber-600'
                }`}>
                  {booking.escrowStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Review Section — completed bookings only, inside left column */}
          {booking.status === 'completed' && isCustomer && (
            <ReviewForm
              bookingId={bookingId}
              providerName={provider?.name}
              onSubmitted={handleReviewSubmitted}
            />
          )}
          {booking.status === 'completed' && !isCustomer && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex items-center gap-3">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-700">Customer review</p>
                <p className="text-xs text-gray-400 mt-0.5">The customer may submit a review for this completed booking.</p>
              </div>
            </div>
          )}

          {/* Dispute Section */}
          {dispute ? (
            <DisputeStatusCard dispute={dispute} />
          ) : (
            (booking.status === 'active' || booking.status === 'completed') && (
              <DisputeForm
                bookingId={bookingId}
                onSuccess={(newDispute) => setDispute(newDispute)}
              />
            )
          )}
        </div>

        {/* Right Column (col 3) — Real-Time Chat Panel (ChatWindow component) */}
        <div className="h-[520px]">
          <ChatWindow
            bookingId={bookingId}
            counterparty={counterpartyName || 'Chat Room'}
            disabled={isBookingClosed}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
