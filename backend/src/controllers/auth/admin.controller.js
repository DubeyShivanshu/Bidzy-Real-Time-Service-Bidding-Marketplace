/**
 * controllers/auth/admin.controller.js — Admin Auth Controller
 *
 * Responsibilities:
 *  - login: Find admin by email, compare password, return JWT
 *  - logout: Clear session
 *  - getMe: Return authenticated admin profile
 *
 * Note: Admin accounts are seeded — no register endpoint.
 */

import User from '../../models/User.js';
import { generateToken } from '../../utils/jwt.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { ROLES } from '../../config/constants.js';

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== ROLES.ADMIN) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = generateToken(user._id, user.role);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return successResponse(res, { user: userResponse, token }, 'Admin logged in successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  return successResponse(res, null, 'Logged out successfully');
};

export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, { user: req.user }, 'Admin profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

