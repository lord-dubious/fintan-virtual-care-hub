import { Router } from 'express';
import {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  updateAppointmentStatusEnhanced,
  rescheduleAppointment,
  cancelAppointmentEnhanced
} from '@/controllers/appointmentController';
import { getAppointmentsCalendar } from '@/controllers/appointmentCalendarController';
import { authenticateToken, authorizeRoles } from '@/middleware/auth';
import { validate } from '@/middleware/validation';

const router = Router();

/**
 * @route   POST /api/appointments
 * @desc    Create new appointment (patients only)
 * @access  Private (Patient)
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('PATIENT'),
  createAppointment
);

/**
 * @route   GET /api/appointments
 * @desc    Get user's appointments (patients see their appointments, providers see their appointments)
 * @access  Private
 */
router.get(
  '/',
  authenticateToken,
  getAppointments
);

/**
 * @route   GET /api/appointments/calendar
 * @desc    Get user's appointments calendar
 * @access  Private
 */
router.get(
  '/calendar',
  authenticateToken,
  getAppointmentsCalendar
);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get specific appointment details
 * @access  Private (Patient, Provider, Admin)
 */
router.get(
  '/:id',
  authenticateToken,
  getAppointment
);

/**
 * @route   PUT /api/appointments/:id/status
 * @desc    Update appointment status
 * @access  Private (Patient, Provider, Admin)
 */
router.put(
  '/:id/status',
  authenticateToken,
  updateAppointmentStatus
);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Cancel appointment
 * @access  Private (Patient, Provider, Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  cancelAppointment
);

/**
 * @route   PUT /api/appointments/:id/status-enhanced
 * @desc    Enhanced appointment status update with lifecycle management
 * @access  Private (Patient, Provider, Admin)
 */
router.put(
  '/:id/status-enhanced',
  authenticateToken,
  updateAppointmentStatusEnhanced
);

/**
 * @route   PUT /api/appointments/:id/reschedule
 * @desc    Reschedule appointment
 * @access  Private (Patient, Provider, Admin)
 */
router.put(
  '/:id/reschedule',
  authenticateToken,
  rescheduleAppointment
);

/**
 * @route   PUT /api/appointments/:id/cancel-enhanced
 * @desc    Enhanced cancel appointment with policies
 * @access  Private (Patient, Provider, Admin)
 */
router.put(
  '/:id/cancel-enhanced',
  authenticateToken,
  cancelAppointmentEnhanced
);

export default router;
