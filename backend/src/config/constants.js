/**
 * config/constants.js — Application-Wide Constants
 *
 * Responsibilities:
 *  - Define role enum values
 *  - Define job/booking/bid status enums
 *  - Define transaction type enums
 *  - Define dispute status enums
 *  - Define verification status enums
 *  - Business rule defaults (loaded from env in service layer)
 */

export const ROLES = Object.freeze({
  CUSTOMER: 'customer',
  PROVIDER: 'provider',
  ADMIN: 'admin',
});

export const JOB_STATUS = Object.freeze({
  OPEN: 'open',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
});

export const BID_STATUS = Object.freeze({
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
});

export const BOOKING_STATUS = Object.freeze({
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

export const ESCROW_STATUS = Object.freeze({
  HELD: 'held',
  RELEASED: 'released',
  REFUNDED: 'refunded',
});

export const TRANSACTION_TYPES = Object.freeze({
  CREDIT: 'credit',
  DEBIT: 'debit',
  REFUND: 'refund',
  COMMISSION: 'commission',
  DEPOSIT_RETURN: 'deposit_return',
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  CAPTURED: 'captured',
  FAILED: 'failed',
  REFUNDED: 'refunded',
});

export const VERIFICATION_STATUS = Object.freeze({
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

export const DISPUTE_STATUS = Object.freeze({
  OPEN: 'open',
  UNDER_REVIEW: 'under_review',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
});

export const AUTH_PROVIDERS = Object.freeze({
  LOCAL: 'local',
  GOOGLE: 'google',
});
