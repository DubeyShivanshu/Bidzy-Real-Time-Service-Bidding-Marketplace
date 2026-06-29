/**
 * controllers/admin/analytics.controller.js — Admin Analytics Controller
 */

import Booking from '../../models/Booking.js';
import User from '../../models/User.js';
import Job from '../../models/Job.js';
import { successResponse } from '../../utils/response.js';

export const getRevenueAnalytics = async (req, res, next) => {
  try {
    // Generate revenue grouped by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueData = await Booking.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$platformFee" },
          totalBookingValue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing dates with 0 revenue
    const filledData = [];
    let currDate = new Date(thirtyDaysAgo);
    const today = new Date();
    
    while (currDate <= today) {
      const dateStr = currDate.toISOString().split('T')[0];
      const existing = revenueData.find(d => d._id === dateStr);
      filledData.push({
        date: dateStr,
        revenue: existing ? existing.revenue : 0,
        totalBookingValue: existing ? existing.totalBookingValue : 0
      });
      currDate.setDate(currDate.getDate() + 1);
    }

    return successResponse(res, filledData);
  } catch (error) {
    next(error);
  }
};

export const getPlatformOverview = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newJobs = await Job.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const newBookings = await Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Let's get daily bookings for activity chart
    const activityData = await Booking.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return successResponse(res, {
      thirtyDayStats: { newUsers, newJobs, newBookings },
      activityData
    });
  } catch (error) {
    next(error);
  }
};
