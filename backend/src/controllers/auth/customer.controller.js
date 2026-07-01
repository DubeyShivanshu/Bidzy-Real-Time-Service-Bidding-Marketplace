/**
 * Customer Auth Controller
 *
 * Responsibilities:
 *  - register: Validate input, hash password, create User (role=customer), return JWT
 *  - login: Find user by email, compare password, return JWT
 *  - googleCallback: Called after Passport OAuth success, issue JWT
 *  - logout: Clear session / blacklist token
 *  - getMe: Return authenticated customer profile (no password)
 */

import User from '../../models/User.js';
import { generateToken } from '../../utils/jwt.js';
import { successResponse, errorResponse } from '../../utils/response.js';
import { ROLES } from '../../config/constants.js';

export const register = async (req, res, next) => {
  const { name, email, phone, city, password } = req.body;

  try {
    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400);
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
      password,
      role: ROLES.CUSTOMER,
    });

    const token = generateToken(user._id, user.role);

    // Don't send back password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      role: user.role,
      walletBalance: user.walletBalance,
      verified: user.verified,
      avatar: user.avatar,
    };

    return successResponse(
      res,
      { user: userResponse, token },
      'Customer registered successfully',
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
    if (!user || user.role !== ROLES.CUSTOMER) {
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
      role: user.role,
      walletBalance: user.walletBalance,
      verified: user.verified,
      avatar: user.avatar,
    };

    return successResponse(res, { user: userResponse, token }, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }

    const token = generateToken(req.user._id, req.user.role);

    const userResponse = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      walletBalance: req.user.walletBalance,
      verified: req.user.verified,
      avatar: req.user.avatar,
    };

    // Redirect to frontend with token and user data in query string
    return res.redirect(
      `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?token=${token}&user=${encodeURIComponent(
        JSON.stringify(userResponse)
      )}`
    );
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
  const { name, phone, city } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (city !== undefined) user.city = city;

    await user.save();

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      role: user.role,
      walletBalance: user.walletBalance,
      verified: user.verified,
      avatar: user.avatar,
    };

    return successResponse(res, { user: userResponse }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const mockGoogleLogin = (req, res) => {
  // Directly redirect to callback with mock query parameters
  const redirectUrl = `${process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/customer/google/callback'}?mock=true`;
  return res.redirect(redirectUrl);
};

export const mockGoogleCallback = async (req, res, next) => {
  try {
    // Find or create a mock Google user in database
    let user = await User.findOne({ email: 'google.mock@bidzy.com' });
    if (!user) {
      user = await User.create({
        name: 'Mock Google User',
        email: 'google.mock@bidzy.com',
        role: ROLES.CUSTOMER,
        authProvider: 'google',
        googleId: 'mock_google_id_12345',
        verified: true,
      });
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

