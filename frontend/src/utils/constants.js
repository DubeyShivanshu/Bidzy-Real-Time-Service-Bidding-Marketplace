/**
 * Frontend Shared Constants
 *
 * Responsibilities:
 *  - Service categories list for job posting / filtering
 *  - Urgency options
 *  - Role constants
 *  - Booking/job status label maps for UI display
 */

export const SERVICE_CATEGORIES = [
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'AC Repair',
  'Appliance Repair',
  'Cleaning',
  'Pest Control',
  'Shifting & Moving',
  'CCTV & Security',
  'Other',
];

export const URGENCY_OPTIONS = [
  { value: 'immediate', label: '🔴 Immediate' },
  { value: 'today', label: '🟡 Today' },
  { value: 'scheduled', label: '🟢 Scheduled' },
];

export const ROLES = { CUSTOMER: 'customer', PROVIDER: 'provider', ADMIN: 'admin' };

export const JOB_STATUS_LABELS = {
  open: { label: 'Open', color: 'badge-green' },
  accepted: { label: 'Accepted', color: 'badge-gray' },
  expired: { label: 'Expired', color: 'badge-red' },
  cancelled: { label: 'Cancelled', color: 'badge-red' },
};

export const BOOKING_STATUS_LABELS = {
  active: { label: 'Active', color: 'badge-green' },
  completed: { label: 'Completed', color: 'badge-gray' },
  cancelled: { label: 'Cancelled', color: 'badge-red' },
};
