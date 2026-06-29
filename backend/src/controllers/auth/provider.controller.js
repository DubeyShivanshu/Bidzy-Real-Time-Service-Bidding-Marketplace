/**
 * controllers/auth/provider.controller.js — Provider Auth Controller
 *
 * Responsibilities:
 *  - register: Validate input, hash password, create User (role=provider), return JWT
 *  - login: Find provider by email, compare password, return JWT
 *  - logout: Clear session
 *  - getMe: Return authenticated provider profile
 */

import User from '../../models/User.js';
import { generateToken } from '../../utils/jwt.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { ROLES } from '../../config/constants.js';

export const register = async (req, res, next) => {
  const { name, email, phone, city, speciality, password } = req.body;

  try {
    if (!name || !email || !password || !city || !speciality) {
      return errorResponse(res, 'Name, email, password, city, and speciality are required', 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, 'User already exists', 400);
    }

    const user = await User.create({
      name,
      email,
      phone,
      city,
      speciality,
      password,
      role: ROLES.PROVIDER,
    });

    const token = generateToken(user._id, user.role);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      speciality: user.speciality,
      role: user.role,
      verified: user.verified,
      rating: user.rating,
      totalReviews: user.totalReviews,
      avatar: user.avatar,
    };

    return successResponse(
      res,
      { user: userResponse, token },
      'Provider registered successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== ROLES.PROVIDER) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    if (user.isSuspended) {
      return errorResponse(res, 'Account is suspended', 403);
    }

    const token = generateToken(user._id, user.role);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      speciality: user.speciality,
      role: user.role,
      verified: user.verified,
      rating: user.rating,
      totalReviews: user.totalReviews,
      avatar: user.avatar,
    };

    return successResponse(res, { user: userResponse, token }, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  return successResponse(res, null, 'Logged out successfully');
};

export const getMe = async (req, res, next) => {
  try {
    return successResponse(res, { user: req.user }, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  const { name, phone, city, speciality, bio } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;
    if (speciality !== undefined) user.speciality = speciality;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      speciality: user.speciality,
      bio: user.bio,
      role: user.role,
      verified: user.verified,
      rating: user.rating,
      totalReviews: user.totalReviews,
      avatar: user.avatar,
    };

    return successResponse(res, { user: userResponse }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

