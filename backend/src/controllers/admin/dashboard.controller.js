/**
 * controllers/admin/dashboard.controller.js — Admin Dashboard Controller
 *
 * Responsibilities:
 *  - getDashboardMetrics: Aggregate real-time platform metrics
 */

import User from '../../models/User.js';
import Job from '../../models/Job.js';
import Booking from '../../models/Booking.js';
import Dispute from '../../models/Dispute.js';
import Verification from '../../models/Verification.js';
import { successResponse } from '../../utils/response.js';

export const getDashboardMetrics = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalProviders,
      verifiedProviders,
      totalJobs,
      openJobs,
      completedJobs,
      cancelledJobs,
      totalBookings,
      activeBookings,
      openDisputes,
      pendingVerifications,
      bookingAggregations
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'provider' }),
      User.countDocuments({ role: 'provider', verified: true }),
      
      Job.countDocuments(),
      Job.countDocuments({ status: 'open' }),
      Job.countDocuments({ status: 'completed' }),
      Job.countDocuments({ status: 'cancelled' }),
      
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'active' }),
      
      Dispute.countDocuments({ status: 'open' }),
      Verification.countDocuments({ status: 'pending' }),

      Booking.aggregate([
        {
          $group: {
            _id: '$status',
            totalRevenue: { $sum: '$platformFee' },
            totalEscrow: { $sum: '$totalAmount' }
          }
        }
      ])
    ]);

    // Parse the aggregation results
    let platformRevenue = 0;
    let pendingEscrow = 0;

    bookingAggregations.forEach(agg => {
      if (agg._id === 'completed') {
        platformRevenue = agg.totalRevenue;
      }
      if (agg._id === 'active') {
        pendingEscrow = agg.totalEscrow;
      }
    });

    const metrics = {
      users: {
        customers: totalCustomers,
        providers: totalProviders,
        verifiedProviders: verifiedProviders,
      },
      jobs: {
        total: totalJobs,
        open: openJobs,
        completed: completedJobs,
        cancelled: cancelledJobs,
      },
      bookings: {
        total: totalBookings,
        active: activeBookings,
      },
      finances: {
        platformRevenue,
        pendingEscrow,
      },
      actionable: {
        openDisputes,
        pendingVerifications,
      }
    };

    return successResponse(res, metrics);
  } catch (error) {
    next(error);
  }
};
