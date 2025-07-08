import { Router } from 'express';
import {
  createConsultationRoom,
  generateConsultationToken,
  getConsultation,
  joinConsultation,
  updateConsultationNotes,
  createConsultation,
  updateConsultationStatus
} from '@/controllers/consultationController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

/**
 * @route   POST /api/consultations/room
 * @desc    Create Daily.co room for consultation
 * @access  Private (Patient, Provider, Admin)
 */
router.post(
  '/room',
  authenticateToken,
  createConsultationRoom
);

/**
 * @route   GET /api/consultations/:appointmentId/token
 * @desc    Generate Daily.co token for participant
 * @access  Private (Patient, Provider, Admin)
 */
router.get(
  '/:appointmentId/token',
  authenticateToken,
  generateConsultationToken
);

/**
 * @route   GET /api/consultations/:appointmentId
 * @desc    Get consultation details
 * @access  Private (Patient, Provider, Admin)
 */
router.get(
  '/:appointmentId',
  authenticateToken,
  getConsultation
);

/**
 * @route   POST /api/consultations/:appointmentId/join
 * @desc    Join consultation and get room URL/token
 * @access  Private (Patient, Provider, Admin)
 */
router.post(
  '/:appointmentId/join',
  authenticateToken,
  joinConsultation
);

/**
 * @route   POST /api/consultations/create/:appointmentId
 * @desc    Create a new consultation
 * @access  Private (Patient, Provider, Admin)
 */
router.post(
  '/create/:appointmentId',
  authenticateToken,
  createConsultation
);

/**
 * @route   PUT /api/consultations/:consultationId/notes
 * @desc    Update consultation notes
 * @access  Private (Patient, Provider, Admin)
 */
router.put(
  '/:consultationId/notes',
  authenticateToken,
  updateConsultationNotes
);

/**
 * @route   PUT /api/consultations/:consultationId/status
 * @desc    Update consultation status
 * @access  Private (Patient, Provider, Admin)
 */
router.put(
  '/:consultationId/status',
  authenticateToken,
  updateConsultationStatus
);

export default router;
