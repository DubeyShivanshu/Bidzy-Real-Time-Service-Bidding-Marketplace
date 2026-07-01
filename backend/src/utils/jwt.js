/**
 * JWT Utility Functions
 *
 * Responsibilities:
 *  - generateToken(userId, role) — Sign JWT with userId + role payload
 *  - verifyToken(token) — Verify and decode JWT
 *  - Used by auth controllers and protect middleware
 */

import jwt from 'jsonwebtoken';

/**
 * generateToken — create signed JWT for a user
 * @param {string} userId
 * @param {string} role — 'customer' | 'provider' | 'admin'
 * @returns {string} JWT token
 */
export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * verifyToken — decode and verify a JWT
 * @param {string} token
 * @returns {object} decoded payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export default { generateToken, verifyToken };

