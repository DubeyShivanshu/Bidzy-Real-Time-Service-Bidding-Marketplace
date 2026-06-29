/**
 * controllers/admin/users.controller.js — Admin User Management Controller
 *
 * Responsibilities:
 *  - getAllUsers: Paginated list with role filter, search by name/email
 *  - getUserById: Full user profile details
 *  - suspendUser: Set isSuspended=true, prevent login
 *  - activateUser: Set isSuspended=false, restore access
 */

import User from '../../models/User.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return paginatedResponse(res, users, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};

export const suspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    if (user.role === 'admin') return errorResponse(res, 'Cannot suspend an admin', 400);

    user.isSuspended = true;
    await user.save();

    return successResponse(res, user, 'User suspended successfully');
  } catch (error) {
    next(error);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);

    user.isSuspended = false;
    await user.save();

    return successResponse(res, user, 'User activated successfully');
  } catch (error) {
    next(error);
  }
};
