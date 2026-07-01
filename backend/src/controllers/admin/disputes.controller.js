/**
 * Admin Dispute Controller
 *
 * Responsibilities:
 *  - getAllDisputes: Paginated list filterable by status
 *  - getDisputeById: Dispute + booking + payment records
 *  - resolveDispute: Resolve dispute, optionally issue refund via wallet.service.js
 *  - getBookingChatForDispute: Read-only chat history for investigation
 */

import Dispute from '../../models/Dispute.js';
import Booking from '../../models/Booking.js';
import ChatMessage from '../../models/ChatMessage.js';
import User from '../../models/User.js';
import { creditWallet, debitWallet } from '../../services/wallet/wallet.service.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';

export const getAllDisputes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;

    const disputes = await Dispute.find(query)
      .populate('raisedBy', 'name email role')
      .populate({
        path: 'bookingId',
        select: 'jobId status escrowStatus totalAmount customerId providerId basePrice',
        populate: [
          { path: 'customerId', select: 'name email' },
          { path: 'providerId', select: 'name email' }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Dispute.countDocuments(query);

    return paginatedResponse(res, disputes, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const getDisputeById = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('raisedBy', 'name email role')
      .populate({
        path: 'bookingId',
        select: 'jobId status escrowStatus totalAmount customerId providerId basePrice securityDeposit platformFee',
        populate: [
          { path: 'customerId', select: 'name email phone' },
          { path: 'providerId', select: 'name email phone' }
        ]
      })
      .populate('resolvedBy', 'name email');

    if (!dispute) return errorResponse(res, 'Dispute not found', 404);

    return successResponse(res, dispute);
  } catch (error) {
    next(error);
  }
};

export const resolveDispute = async (req, res, next) => {
  try {
    const { resolution, issueRefund, refundAmount } = req.body;
    if (!resolution) return errorResponse(res, 'Resolution note is required', 400);

    const dispute = await Dispute.findById(req.params.id).populate('bookingId');
    if (!dispute) return errorResponse(res, 'Dispute not found', 404);
    if (dispute.status === 'resolved' || dispute.status === 'closed') {
      return errorResponse(res, 'Dispute is already resolved/closed', 400);
    }

    const booking = dispute.bookingId;

    if (issueRefund) {
      if (!refundAmount || refundAmount <= 0) {
        return errorResponse(res, 'Valid refund amount is required', 400);
      }
      if (refundAmount > booking.totalAmount) {
        return errorResponse(res, 'Refund amount cannot exceed total booking amount', 400);
      }

      // Refund to customer wallet
      await creditWallet(
        booking.customerId,
        refundAmount,
        `Dispute resolution refund for booking ${booking._id}`,
        { type: 'refund', bookingId: booking._id }
      );

      dispute.refundIssued = true;
      dispute.refundAmount = refundAmount;
      
      // We might want to update booking escrow status to 'refunded' if it was fully refunded
      // For now, let's leave booking status alone or update escrowStatus if it's currently held.
      if (booking.escrowStatus === 'held') {
        booking.escrowStatus = 'refunded';
        booking.status = 'cancelled';
        await booking.save();
      } else if (booking.escrowStatus === 'released') {
        // If escrow was already released, we must debit the provider (and admin for platform fee)
        // For simplicity, we attempt to debit the provider for their basePrice, and admin for platformFee
        try {
          await debitWallet(
            booking.providerId,
            booking.basePrice,
            `Dispute refund deduction for booking ${booking._id}`,
            { type: 'debit', bookingId: booking._id }
          );
          
          const admin = await User.findOne({ role: 'admin' });
          if (admin && booking.platformFee > 0) {
            await debitWallet(
              admin._id,
              booking.platformFee,
              `Dispute commission reversal for booking ${booking._id}`,
              { type: 'debit', bookingId: booking._id }
            );
          }
        } catch (debitErr) {
          console.error("Failed to debit provider/admin wallets during post-completion refund:", debitErr);
        }

        booking.escrowStatus = 'refunded';
        await booking.save();
      }
    } else {
      // If no refund issued, the escrow is released to provider
      if (booking.escrowStatus === 'held') {
        booking.escrowStatus = 'released';
        booking.status = 'completed';
        await booking.save();
        
        await creditWallet(
          booking.providerId,
          booking.basePrice,
          `Payment for completed booking ${booking._id}`,
          { type: 'payment', bookingId: booking._id }
        );
      }
    }

    dispute.resolution = resolution;
    dispute.status = 'resolved';
    dispute.resolvedAt = new Date();
    dispute.resolvedBy = req.user._id;
    await dispute.save();

    return successResponse(res, dispute, 'Dispute resolved successfully');
  } catch (error) {
    next(error);
  }
};

export const getBookingChatForDispute = async (req, res, next) => {
  try {
    const messages = await ChatMessage.find({ bookingId: req.params.bookingId })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 });

    return successResponse(res, messages);
  } catch (error) {
    next(error);
  }
};
