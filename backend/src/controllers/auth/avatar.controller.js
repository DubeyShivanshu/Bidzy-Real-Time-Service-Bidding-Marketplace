/**
 * controllers/auth/avatar.controller.js — Avatar Upload Controller
 *
 * Responsibilities:
 *  - uploadAvatar: Upload image to Cloudinary and update User avatar field
 *  - deleteAvatar: Remove image from Cloudinary and set User avatar to null
 */

import User from '../../models/User.js';
import cloudinary from '../../config/cloudinary.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No image file provided', 400);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Upload to Cloudinary using stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'bidzy/avatars',
        transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }],
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return errorResponse(res, 'Failed to upload image to Cloudinary', 500);
        }

        // Save new avatar URL to user
        user.avatar = result.secure_url;
        await user.save();

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

        return successResponse(res, { user: userResponse }, 'Avatar uploaded successfully');
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};

export const deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (!user.avatar) {
      return errorResponse(res, 'User does not have an avatar', 400);
    }

    // Extract public_id from secure_url
    // Example: https://res.cloudinary.com/.../image/upload/v1234/bidzy/avatars/abcde.png
    const urlParts = user.avatar.split('/');
    const folderAndFile = urlParts.slice(-2).join('/'); // 'bidzy/avatars/abcde.png'
    const publicId = folderAndFile.split('.')[0]; // 'bidzy/avatars/abcde'

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Update DB
    user.avatar = null;
    await user.save();

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

    return successResponse(res, { user: userResponse }, 'Avatar deleted successfully');
  } catch (error) {
    next(error);
  }
};
