import ChatMessage from '../../models/ChatMessage.js';
import Booking from '../../models/Booking.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const getChatHistory = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    // Find the booking to verify authorization
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }

    // Authorization check: Must be customer, provider, or admin
    const userId = req.user._id.toString();
    const isCustomer = booking.customerId.toString() === userId;
    const isProvider = booking.providerId.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isProvider && !isAdmin) {
      return errorResponse(res, 'You are not authorized to view this chat history', 403);
    }

    // Fetch messages sorted by time
    const messages = await ChatMessage.find({ bookingId })
      .sort({ createdAt: 1 })
      .limit(100); // safety cap

    return successResponse(res, messages, 'Chat history retrieved successfully');
  } catch (error) {
    next(error);
  }
};

