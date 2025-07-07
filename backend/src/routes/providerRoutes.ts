import { Router } from 'express';
import {
  getProviders,
  getProvider,
  getProviderAvailability,
  updateProvider,
  getProviderDashboard,
} from '@/controllers/providerController';
import { authenticateToken, authorizeRoles } from '@/middleware/auth';
import { rateLimiters } from '@/middleware/rateLimiter';

const router = Router();

/**
 * @route   GET /api/providers
 * @desc    Get all providers
 * @access  Public
 * @query   specialization, isActive, page, limit
 */
router.get(
  '/',
  rateLimiters.api,
  getProviders
);

/**
 * @route   GET /api/providers/:id
 * @desc    Get provider by ID
 * @access  Public
 */
router.get(
  '/:id',
  rateLimiters.api,
  getProvider
);

/**
 * @route   GET /api/providers/:id/availability
 * @desc    Get provider availability
 * @access  Public
 */
router.get(
  '/:id/availability',
  rateLimiters.api,
  getProviderAvailability
);

/**
 * @route   PUT /api/providers/:id
 * @desc    Update provider profile
 * @access  Private (Provider, Admin)
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('PROVIDER', 'ADMIN'),
  rateLimiters.api,
  updateProvider
);

/**
 * @route   GET /api/providers/dashboard
 * @desc    Get provider dashboard data
 * @access  Private (Provider, Doctor)
 */
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRoles('PROVIDER', 'DOCTOR'),
  rateLimiters.api,
  getProviderDashboard
);

export default router;
