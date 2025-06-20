import { Router } from 'express';
import { 
  createConsultationRoom,
  generateConsultationToken,
  getConsultation
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

export default router;
