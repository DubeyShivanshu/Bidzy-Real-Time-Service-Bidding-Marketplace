/**
 * Provider Profile Controller
 *
 * Responsibilities:
 *  - getProviderProfile: Public profile with reviews (rating, totalReviews, verified badge)
 *  - updateProfile: Update name, phone, city, speciality (authenticated provider only)
 *  - submitVerification: Upsert Verification record with Multer-uploaded file paths
 *  - getVerificationStatus: Return current verification status + adminNote for the provider
 */

import User from '../../models/User.js';
import Verification from '../../models/Verification.js';
import Review from '../../models/Review.js';
import { VERIFICATION_STATUS } from '../../config/constants.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';
import path from 'path';

/**
 * GET /api/providers/:id
 * Public — return provider profile with reviews.
 */
export const getProviderProfile = async (req, res, next) => {
  try {
    const provider = await User.findById(req.params.id)
      .select('name city speciality rating totalReviews verified createdAt');

    if (!provider || provider.role === 'admin') {
      return errorResponse(res, 'Provider not found', 404);
    }

    // Fetch recent reviews (last 5)
    const reviews = await Review.find({ providerId: req.params.id })
      .populate('customerId', 'name city')
      .sort({ createdAt: -1 })
      .limit(5);

    return successResponse(res, { provider, reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/providers/profile
 * Authenticated provider — update their own profile fields.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city, speciality } = req.body;

    const allowedUpdates = {};
    if (name?.trim()) allowedUpdates.name = name.trim();
    if (phone?.trim()) allowedUpdates.phone = phone.trim();
    if (city?.trim()) allowedUpdates.city = city.trim();
    if (speciality?.trim()) allowedUpdates.speciality = speciality.trim();

    if (Object.keys(allowedUpdates).length === 0) {
      return errorResponse(res, 'No valid fields to update', 400);
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    return successResponse(res, updated, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/providers/verification
 * Authenticated provider — submit/re-submit verification documents.
 * Files are handled by Multer (upload.fields) middleware before this runs.
 */
export const submitVerification = async (req, res, next) => {
  try {
    const files = req.files || {};

    const cloudinary = (await import('../../config/cloudinary.js')).default;
    
    // Upload helper function
    const uploadToCloudinary = (file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `bidzy/verification/${req.user._id}`,
            public_id: `${file.fieldname}-${Date.now()}`,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    };

    const updatePayload = {
      status: VERIFICATION_STATUS.PENDING,
      adminNote: '',
      reviewedAt: null,
      reviewedBy: null,
    };

    if (files.aadhaar?.[0]) updatePayload.aadhaarUrl = await uploadToCloudinary(files.aadhaar[0]);
    if (files.pan?.[0]) updatePayload.panUrl = await uploadToCloudinary(files.pan[0]);
    if (files.other?.length) {
      updatePayload.otherDocs = await Promise.all(
        files.other.map(async (f, i) => ({
          label: `Document ${i + 1}`,
          url: await uploadToCloudinary(f),
        }))
      );
    }

    if (!updatePayload.aadhaarUrl && !updatePayload.panUrl && !updatePayload.otherDocs) {
      return errorResponse(res, 'Please upload at least one document (Aadhaar, PAN, or other)', 400);
    }

    // Upsert: create new or reset existing submission
    const verification = await Verification.findOneAndUpdate(
      { providerId: req.user._id },
      { $set: { ...updatePayload, providerId: req.user._id } },
      { new: true, upsert: true, runValidators: true }
    );

    return successResponse(res, verification, 'Verification documents submitted. Under review.');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/providers/verification/status
 * Authenticated provider — get their own verification status.
 */
export const getVerificationStatus = async (req, res, next) => {
  try {
    const verification = await Verification.findOne({ providerId: req.user._id });

    if (!verification) {
      return successResponse(res, {
        status: 'not_submitted',
        message: 'No verification documents submitted yet.',
      });
    }

    return successResponse(res, {
      status: verification.status,
      adminNote: verification.adminNote || null,
      aadhaarUrl: verification.aadhaarUrl || null,
      panUrl: verification.panUrl || null,
      otherDocs: verification.otherDocs || [],
      submittedAt: verification.createdAt,
      reviewedAt: verification.reviewedAt || null,
    });
  } catch (error) {
    next(error);
  }
};

