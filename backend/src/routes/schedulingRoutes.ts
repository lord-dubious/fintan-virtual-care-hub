import { Router } from 'express';
import { 
  getAvailableSlots,
  checkSlotAvailability,
  createRecurringAppointments,
  getTimezones
} from '@/controllers/schedulingController';
import { authenticateToken, authorizeRoles } from '@/middleware/auth';
import { rateLimiters } from '@/middleware/rateLimiter';

const router = Router();

/**
 * @route   GET /api/scheduling/available-slots
 * @desc    Get available time slots for a provider
 * @access  Private
 * @query   providerId, date (YYYY-MM-DD), timezone, duration (optional)
 */
router.get(
  '/available-slots',
  authenticateToken,
  rateLimiters.api,
  getAvailableSlots
);

/**
 * @route   POST /api/scheduling/check-availability
 * @desc    Check if a specific time slot is available
 * @access  Private
 */
router.post(
  '/check-availability',
  authenticateToken,
  rateLimiters.api,
  checkSlotAvailability
);

/**
 * @route   POST /api/scheduling/recurring-appointments
 * @desc    Create recurring appointments
 * @access  Private (Patient only)
 */
router.post(
  '/recurring-appointments',
  authenticateToken,
  authorizeRoles('PATIENT'),
  rateLimiters.api,
  createRecurringAppointments
);

/**
 * @route   GET /api/scheduling/timezones
 * @desc    Get list of supported timezones
 * @access  Private
 */
router.get(
  '/timezones',
  authenticateToken,
  getTimezones
);

export default router;
