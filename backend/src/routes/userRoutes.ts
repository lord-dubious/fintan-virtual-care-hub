import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updatePatientProfile,
  updateProviderProfile,
  getProviders,
  updateProviderAvailability,
  getProviderAvailability
} from '@/controllers/userController';
import { authenticateToken, authorizeRoles } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import { schemas } from '@/middleware/validation';

const router = Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile with role-specific data
 * @access  Private
 */
router.get(
  '/profile',
  authenticateToken,
  getProfile
);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user basic profile (name, phone)
 * @access  Private
 */
router.put(
  '/profile',
  authenticateToken,
  updateProfile
);

/**
 * @route   PUT /api/users/patient-profile
 * @desc    Update patient-specific profile data
 * @access  Private (Patient only)
 */
router.put(
  '/patient-profile',
  authenticateToken,
  authorizeRoles('PATIENT'),
  updatePatientProfile
);

/**
 * @route   PUT /api/users/provider-profile
 * @desc    Update provider-specific profile data
 * @access  Private (Provider only)
 */
router.put(
  '/provider-profile',
  authenticateToken,
  authorizeRoles('PROVIDER'),
  updateProviderProfile
);

/**
 * @route   GET /api/users/providers
 * @desc    Get list of verified providers (for patients to browse)
 * @access  Private
 */
router.get(
  '/providers',
  authenticateToken,
  getProviders
);

/**
 * @route   PUT /api/users/provider-availability
 * @desc    Update provider availability schedule
 * @access  Private (Provider only)
 */
router.put('/provider-availability', authenticateToken, updateProviderAvailability);

/**
 * @route   GET /api/users/provider-availability
 * @desc    Get provider availability schedule
 * @access  Private
 */
router.get('/provider-availability', authenticateToken, getProviderAvailability);

export default router;
