/**
 * components/auth/GoogleOAuthButton.jsx — Google OAuth Login Button
 *
 * Responsibilities:
 *  - "Continue with Google" styled button (Google brand guidelines)
 *  - Redirect to /api/auth/customer/google OAuth flow
 *  - CUSTOMER ONLY — do NOT render for provider or admin
 */
import React from 'react';

export const GoogleOAuthButton = () => {
  const handleGoogleLogin = () => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${backendUrl}/auth/customer/google`;
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1, 0, 0, 1, 0, 0)">
          <path
            d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4c0,-0.37 -0.03,-0.74 -0.08,-1H21.35z"
            fill="#4285F4"
          />
          <path
            d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.6c-0.92,0.6 -2.1,0.97 -2.66,0.97c-2.04,0 -3.77,-1.38 -4.38,-3.23H4.21v2.7C5.7,19.34 8.65,20.6 12,20.6z"
            fill="#34A853"
          />
          <path
            d="M7.62,13.54c-0.15,-0.47 -0.24,-0.97 -0.24,-1.49c0,-0.52 0.09,-1.02 0.24,-1.49V7.85H4.21C3.7,8.87 3.4,10.02 3.4,11.23c0,1.21 0.3,2.36 0.81,3.38L7.62,13.54z"
            fill="#FBBC05"
          />
          <path
            d="M12,5.65c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,2.94 14.42,2.15 12,2.15c-3.35,0 -6.3,1.26 -7.79,3.13l3.41,2.72c0.61,-1.85 2.34,-3.23 4.38,-3.23z"
            fill="#EA4335"
          />
        </g>
      </svg>
      <span>Continue with Google</span>
    </button>
  );
};

export default GoogleOAuthButton;

