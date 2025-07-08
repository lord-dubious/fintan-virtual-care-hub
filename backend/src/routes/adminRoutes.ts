import { Router } from 'express';
import { 
  getPendingProviders,
  approveProvider,
  rejectProvider,
  getAllProviders
} from '@/controllers/adminController';
import { authenticateToken, authorizeRoles } from '@/middleware/auth';

const router = Router();

/**
 * @route   GET /api/admin/providers/pending
 * @desc    Get pending providers for admin approval
 * @access  Private (Admin only)
 */
router.get(
  '/providers/pending',
  authenticateToken,
  authorizeRoles('ADMIN'),
  getPendingProviders
);

/**
 * @route   GET /api/admin/providers
 * @desc    Get all providers with filtering and search
 * @access  Private (Admin only)
 */
router.get(
  '/providers',
  authenticateToken,
  authorizeRoles('ADMIN'),
  getAllProviders
);

/**
 * @route   PUT /api/admin/providers/:id/approve
 * @desc    Approve a provider
 * @access  Private (Admin only)
 */
router.put(
  '/providers/:id/approve',
  authenticateToken,
  authorizeRoles('ADMIN'),
  approveProvider
);

/**
 * @route   PUT /api/admin/providers/:id/reject
 * @desc    Reject a provider
 * @access  Private (Admin only)
 */
router.put(
  '/providers/:id/reject',
  authenticateToken,
  authorizeRoles('ADMIN'),
  rejectProvider
);

export default router;
