import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, AUTH_PROVIDERS } from '../config/constants.js';


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      // Not required — Google OAuth users may not have a password
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
    },
    city: {
      type: String,
      trim: true,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    speciality: {
      // Provider only — e.g. "Electrician", "Plumber"
      type: String,
      trim: true,
    },
    googleId: {
      type: String,
      sparse: true, // Allow null for non-OAuth users
    },
    authProvider: {
      type: String,
      enum: Object.values(AUTH_PROVIDERS),
      default: AUTH_PROVIDERS.LOCAL,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password with bcryptjs (skip if googleId exists or password is not modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.googleId) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method: comparePassword(candidatePassword)
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

