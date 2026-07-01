/**
 * Responsibilities:
 *  - Configure GoogleStrategy for CUSTOMER role ONLY
 *  - Find or create user in DB on successful OAuth
 *  - Serialize / deserialize user for session
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import { ROLES, AUTH_PROVIDERS } from './constants.js';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0]?.value;

          // Find user by googleId
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // Find user by email
            user = await User.findOne({ email });

            if (user) {
              // Link google account
              user.googleId = profile.id;
              user.authProvider = AUTH_PROVIDERS.GOOGLE;
              await user.save();
            } else {
              // Create new customer user
              user = await User.create({
                name: profile.displayName || profile.name?.givenName || 'Google User',
                email,
                role: ROLES.CUSTOMER,
                authProvider: AUTH_PROVIDERS.GOOGLE,
                googleId: profile.id,
                verified: true, // Google accounts are pre-verified
              });
            }
          }

          if (user.isSuspended) {
            return done(null, false, { message: 'Account is suspended' });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

