import { Router } from 'express';
import {
  getAvailability,
  getDayAvailability,
  blockTimeSlot,
  unblockTimeSlot,
} from '@/controllers/calendarController';
import { authenticateToken, authorizeRoles } from '@/middleware/auth';
import { rateLimiters } from '@/middleware/rateLimiter';

const router = Router();

/**
 * @route   GET /api/calendar/availability
 * @desc    Get availability for a provider within a date range
 * @access  Private
 * @query   providerId, dateFrom (ISO string), dateTo (ISO string), consultationType (optional)
 */
router.get(
  '/availability',
  authenticateToken,
  rateLimiters.api,
  getAvailability
);

/**
 * @route   GET /api/calendar/availability/:providerId
 * @desc    Get availability for a specific day
 * @access  Private
 * @query   date (YYYY-MM-DD)
 */
router.get(
  '/availability/:providerId',
  authenticateToken,
  rateLimiters.api,
  getDayAvailability
);

/**
 * @route   POST /api/calendar/block-time
 * @desc    Block a time slot in provider's calendar
 * @access  Private (Provider, Admin)
 */
router.post(
  '/block-time',
  authenticateToken,
  authorizeRoles('PROVIDER', 'ADMIN'),
  rateLimiters.api,
  blockTimeSlot
);

/**
 * @route   DELETE /api/calendar/block-time
 * @desc    Unblock a time slot in provider's calendar
 * @access  Private (Provider, Admin)
 * @query   providerId, date (YYYY-MM-DD), startTime (HH:MM)
 */
router.delete(
  '/block-time',
  authenticateToken,
  authorizeRoles('PROVIDER', 'ADMIN'),
  rateLimiters.api,
  unblockTimeSlot
);

export default router;
