import { Router } from 'express';
import {
  getPatientDashboard,
} from '@/controllers/patientController';
import { authenticateToken, authorizeRoles } from '@/middleware/auth';

const router = Router();

/**
 * @route   GET /api/patients/dashboard
 * @desc    Get patient dashboard data
 * @access  Private (Patient)
 */
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRoles('PATIENT'),
  getPatientDashboard
);

export default router;
