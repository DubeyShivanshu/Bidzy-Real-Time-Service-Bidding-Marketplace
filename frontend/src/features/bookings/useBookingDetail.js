/**
 * features/bookings/useBookingDetail.js
 *
 * Responsibilities:
 *  - Retrieve details for single booking
 *  - Handle cancellation, completion, escrow release logic
 */

import { useState } from 'react';
import useBookingStore from '@store/bookings/bookingStore.js';
import * as bookingService from '@services/bookings/booking.service.js';

export const useBookingDetail = (bookingId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { activeBooking, setActiveBooking, updateBookingStatus } = useBookingStore();

  const fetchDetail = async () => {};
  const completeBooking = async () => {};
  const cancelBooking = async () => {};

  return { booking: activeBooking, fetchDetail, completeBooking, cancelBooking, loading, error };
};

export default useBookingDetail;
