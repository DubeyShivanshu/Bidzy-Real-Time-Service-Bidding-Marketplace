/**
 * Bid Controller
 *
 * Responsibilities:
 *  - submitBid: Validate, create Bid with provider snapshot, emit bid:new to job room
 *  - getBidsForJob: Return all bids for a job (customer who owns it)
 *  - getMyBids: Return all bids submitted by authenticated provider
 *  - acceptBid: Accept bid → trigger booking creation via booking.service.js, emit bid:accepted
 *  - rejectBid: Mark bid as rejected
 */

import Bid from '../../models/Bid.js';
import Job from '../../models/Job.js';
import { JOB_STATUS, BID_STATUS } from '../../config/constants.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { getIO } from '../../config/socket.js';
import { createBooking } from '../../services/bookings/booking.service.js';

export const submitBid = async (req, res, next) => {
  const { jobId, price, message, eta } = req.body;

  try {
    if (!jobId || !price) {
      return errorResponse(res, 'Job ID and price are required', 400);
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return errorResponse(res, 'Job not found', 404);
    }

    if (job.status !== JOB_STATUS.OPEN) {
      return errorResponse(res, 'Bidding is closed for this job', 400);
    }

    if (new Date(job.expiresAt) < new Date()) {
      return errorResponse(res, 'This job has already expired', 400);
    }

    // Check compound unique restriction (one bid per provider per job)
    const existingBid = await Bid.findOne({ jobId, providerId: req.user._id });
    if (existingBid) {
      return errorResponse(res, 'You have already submitted a bid for this job', 400);
    }

    const bid = await Bid.create({
      jobId,
      providerId: req.user._id,
      providerSnapshot: {
        name: req.user.name,
        rating: req.user.rating || 5.0,
        totalReviews: req.user.totalReviews || 0,
        speciality: req.user.speciality,
        city: req.user.city,
        verified: req.user.verified || false,
      },
      price,
      message,
      eta,
    });

    // Increment bid count on job
    job.bidCount = (job.bidCount || 0) + 1;
    await job.save();

    // Notify room of new bid placement
    try {
      const io = getIO();
      if (io) {
        io.to(`job:${jobId}`).emit('bid:new', bid);
      }
    } catch (socketError) {
      console.warn('Real-time socket emit for new bid failed:', socketError.message);
    }

    return successResponse(res, bid, 'Bid placed successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getBidsForJob = async (req, res, next) => {
  const { jobId } = req.params;

  try {
    let query = { jobId };
    
    // Enforce blind bidding: providers can only see their own bids
    if (req.user.role === 'provider') {
      query.providerId = req.user._id;
    }

    const bids = await Bid.find(query).sort({ price: 1 }); // Sorted by lowest price first
    return successResponse(res, bids, 'Bids retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ providerId: req.user._id })
      .populate('jobId', 'service description budget status')
      .sort({ createdAt: -1 });
    return successResponse(res, bids, 'Your bids retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const acceptBid = async (req, res, next) => {
  const { id } = req.params;

  try {
    const bid = await Bid.findById(id);
    if (!bid) return errorResponse(res, 'Bid not found', 404);

    const job = await Job.findById(bid.jobId);
    if (!job) return errorResponse(res, 'Associated job not found', 404);

    // Verify the customer owns this job
    if (job.customerId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to accept bids for this job', 403);
    }

    // Only block if the job has already been accepted/cancelled — expired jobs can still be accepted
    if (job.status !== JOB_STATUS.OPEN && job.status !== JOB_STATUS.EXPIRED) {
      return errorResponse(res, 'Job is no longer open for accepting bids', 400);
    }

    // --- Create Booking + Hold Escrow ---
    let booking;
    try {
      booking = await createBooking(
        job._id.toString(),
        bid._id.toString(),
        req.user._id.toString(),
        bid.providerId.toString(),
        bid.price
      );
    } catch (bookingErr) {
      if (bookingErr.code === 'INSUFFICIENT_BALANCE') {
        return errorResponse(
          res,
          `Insufficient wallet balance. Required: ₹${bookingErr.required}, Available: ₹${bookingErr.available}`,
          400
        );
      }
      throw bookingErr;
    }

    // Update bid status to accepted
    bid.status = BID_STATUS.ACCEPTED;
    await bid.save();

    // Update job status to accepted
    job.status = JOB_STATUS.ACCEPTED;
    await job.save();

    // Reject all other pending bids for this job
    await Bid.updateMany(
      { jobId: job._id, _id: { $ne: bid._id }, status: BID_STATUS.PENDING },
      { status: BID_STATUS.REJECTED }
    );

    // Notify room of acceptance (include bookingId for frontend navigation)
    try {
      const io = getIO();
      if (io) {
        io.to(`job:${job._id}`).emit('bid:accepted', {
          jobId: job._id,
          bidId: bid._id,
          bookingId: booking._id,
          providerId: bid.providerId,
        });
      }
    } catch (socketError) {
      console.warn('Socket emit for bid acceptance failed:', socketError.message);
    }

    return successResponse(res, { bid, booking }, 'Bid accepted and booking created successfully');
  } catch (error) {
    next(error);
  }
};


export const rejectBid = async (req, res, next) => {
  const { id } = req.params;

  try {
    const bid = await Bid.findById(id);
    if (!bid) {
      return errorResponse(res, 'Bid not found', 404);
    }

    const job = await Job.findById(bid.jobId);
    if (job && job.customerId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Not authorized to reject this bid', 403);
    }

    bid.status = BID_STATUS.REJECTED;
    await bid.save();

    try {
      const io = getIO();
      if (io) {
        io.emit('bid:rejected', {
          jobId: bid.jobId,
          bidId: bid._id,
          providerId: bid.providerId,
        });
      }
    } catch (socketError) {
      console.warn('Socket emit for bid rejection failed:', socketError.message);
    }

    return successResponse(res, bid, 'Bid rejected successfully');
  } catch (error) {
    next(error);
  }
};

