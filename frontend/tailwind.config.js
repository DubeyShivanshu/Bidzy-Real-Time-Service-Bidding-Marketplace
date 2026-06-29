/** @type {import('tailwindcss').Config} */

/**
 * tailwind.config.js — Bidzy Design System
 *
 * Design Reference: Trove marketplace
 * Theme: Light, minimal, card-heavy, professional marketplace
 *
 * Color Palette:
 *  Primary:     #16a34a (green-600) — CTAs, active states, accents
 *  Primary Light: #dcfce7 (green-100) — subtle backgrounds
 *  Surface:     #ffffff — cards, modals
 *  Background:  #f9fafb (gray-50) — page background
 *  Text:        #111827 (gray-900) — primary text
 *  Text Muted:  #6b7280 (gray-500) — secondary text
 *  Border:      #e5e7eb (gray-200) — card borders, dividers
 *  Danger:      #dc2626 (red-600) — errors, destructive actions
 *  Warning:     #d97706 (amber-600) — pending states
 */

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#000000',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          500: '#374151',
          600: '#000000',
          700: '#1f2937',
        },
        green: {
          50: '#f9fafb',
          100: '#f3f4f6',
          150: '#e5e7eb',
          200: '#d1d5db',
          300: '#9ca3af',
          400: '#6b7280',
          500: '#4b5563',
          600: '#000000', // Buttons turn black
          700: '#1f2937', // Button hover turns dark gray
          800: '#111827',
          900: '#030712',
          950: '#000000',
        },
        gray: {
          50: '#ededed', // rgb(237, 237, 237)
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        surface: '#ffffff',
        bg: '#ededed',
        border: '#e5e7eb',
        muted: '#6b7280',
        danger: '#dc2626',
        warning: '#d97706',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.08)',
        modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
