/**
 * features/bookings/useBookings.js
 *
 * Responsibilities:
 *  - Retrieve logged-in user's bookings list
 */

import { useState } from 'react';
import useBookingStore from '@store/bookings/bookingStore.js';
import * as bookingService from '@services/bookings/booking.service.js';

export const useBookings = (role) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { bookings, setBookings } = useBookingStore();

  const fetchBookings = async () => {};

  return { bookings, fetchBookings, loading, error };
};

export default useBookings;
