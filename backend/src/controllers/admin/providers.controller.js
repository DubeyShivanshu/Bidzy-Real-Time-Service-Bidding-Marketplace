/**
 * controllers/admin/providers.controller.js — Admin Provider Management Controller
 *
 * Responsibilities:
 *  - getAllProviders: Paginated list with verification status filter
 *  - getProviderById: Provider profile + verification documents
 *  - verifyProvider: Approve verification → set User.verified=true, Verification.status=approved
 *  - rejectProvider: Reject with adminNote → Verification.status=rejected
 *  - suspendProvider: Set isSuspended=true on provider User
 */

import User from '../../models/User.js';
import Verification from '../../models/Verification.js';
import { successResponse, errorResponse, paginatedResponse } from '../../utils/response.js';

export const getAllProviders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { role: 'provider' };
    
    // We will find users, then aggregate with Verification if status filter is provided.
    // For simplicity, we just return the providers, and if a verification filter is there, we fetch Verifications first.
    if (req.query.status) {
      const verifications = await Verification.find({ status: req.query.status }).select('providerId');
      const providerIds = verifications.map(v => v.providerId);
      query._id = { $in: providerIds };
    }

    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const providers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch verification status for all returned providers
    const providerIds = providers.map(p => p._id);
    const verifications = await Verification.find({ providerId: { $in: providerIds } });
    
    const providersWithVerifications = providers.map(p => {
      const verification = verifications.find(v => v.providerId.toString() === p._id.toString());
      return {
        ...p.toObject(),
        verificationStatus: verification ? verification.status : 'unsubmitted',
        verificationId: verification ? verification._id : null
      };
    });

    const total = await User.countDocuments(query);

    return paginatedResponse(res, providersWithVerifications, page, limit, total);
  } catch (error) {
    next(error);
  }
};

export const getProviderById = async (req, res, next) => {
  try {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' }).select('-password');
    if (!provider) return errorResponse(res, 'Provider not found', 404);

    const verification = await Verification.findOne({ providerId: provider._id });

    return successResponse(res, { provider, verification });
  } catch (error) {
    next(error);
  }
};

export const verifyProvider = async (req, res, next) => {
  try {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' });
    if (!provider) return errorResponse(res, 'Provider not found', 404);

    const verification = await Verification.findOne({ providerId: provider._id });
    if (!verification) return errorResponse(res, 'No verification submitted', 400);

    verification.status = 'approved';
    verification.adminNote = '';
    verification.reviewedAt = new Date();
    verification.reviewedBy = req.user._id;
    await verification.save();

    provider.verified = true;
    await provider.save();

    return successResponse(res, { provider, verification }, 'Provider verified successfully');
  } catch (error) {
    next(error);
  }
};

export const rejectProvider = async (req, res, next) => {
  try {
    const { adminNote } = req.body;
    if (!adminNote) return errorResponse(res, 'Admin note is required for rejection', 400);

    const provider = await User.findOne({ _id: req.params.id, role: 'provider' });
    if (!provider) return errorResponse(res, 'Provider not found', 404);

    const verification = await Verification.findOne({ providerId: provider._id });
    if (!verification) return errorResponse(res, 'No verification submitted', 400);

    verification.status = 'rejected';
    verification.adminNote = adminNote;
    verification.reviewedAt = new Date();
    verification.reviewedBy = req.user._id;
    await verification.save();

    provider.verified = false; // Revoke if previously verified
    await provider.save();

    return successResponse(res, { provider, verification }, 'Provider verification rejected');
  } catch (error) {
    next(error);
  }
};

export const suspendProvider = async (req, res, next) => {
  try {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' });
    if (!provider) return errorResponse(res, 'Provider not found', 404);

    provider.isSuspended = !provider.isSuspended;
    await provider.save();

    return successResponse(res, provider, `Provider ${provider.isSuspended ? 'suspended' : 'activated'} successfully`);
  } catch (error) {
    next(error);
  }
};
