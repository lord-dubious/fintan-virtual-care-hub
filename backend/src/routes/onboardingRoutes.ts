import { Router } from 'express';
import { 
  startOnboarding,
  submitOnboardingStep,
  getOnboardingStatus,
  exportPatientData
} from '@/controllers/onboardingController';
import { authenticateToken, authorizeRoles } from '@/middleware/auth';

const router = Router();

/**
 * @route   POST /api/patients/onboarding/start
 * @desc    Start patient onboarding process
 * @access  Private (Patient only)
 */
router.post(
  '/start',
  authenticateToken,
  authorizeRoles('PATIENT'),
  startOnboarding
);

/**
 * @route   POST /api/patients/onboarding/step
 * @desc    Submit onboarding step data
 * @access  Private (Patient only)
 */
router.post(
  '/step',
  authenticateToken,
  authorizeRoles('PATIENT'),
  submitOnboardingStep
);

/**
 * @route   GET /api/patients/onboarding/status
 * @desc    Get onboarding status and progress
 * @access  Private (Patient only)
 */
router.get(
  '/status',
  authenticateToken,
  authorizeRoles('PATIENT'),
  getOnboardingStatus
);

/**
 * @route   GET /api/patients/onboarding/export
 * @desc    Export patient data for compliance
 * @access  Private (Patient only)
 */
router.get(
  '/export',
  authenticateToken,
  authorizeRoles('PATIENT'),
  exportPatientData
);

export default router;
