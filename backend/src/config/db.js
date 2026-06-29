/**
 * config/db.js — MongoDB Connection Factory
 *
 * Responsibilities:
 *  - Create Mongoose connection using MONGO_URI from env
 *  - Log connection success / failure
 *  - Export connectDB function called from server.js
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import { ROLES, AUTH_PROVIDERS } from './constants.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default admin
    const adminExists = await User.findOne({ role: ROLES.ADMIN });
    if (!adminExists) {
      await User.create({
        name: 'Bidzy Admin',
        email: 'admin@bidzy.com',
        password: 'Admin@12345', // Will be automatically hashed by User Schema pre-save hook
        role: ROLES.ADMIN,
        authProvider: AUTH_PROVIDERS.LOCAL,
        verified: true,
      });
      console.log('Default Admin Account Seeded (admin@bidzy.com / Admin@12345)');
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

