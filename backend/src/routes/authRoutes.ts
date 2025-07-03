import { Router } from 'express';
import {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  refreshToken,
  setCookies,
  getCSRFToken
} from '@/controllers/authController';
import {
  authenticateWithSocial,
  getSocialProviderConfig
} from '@/controllers/socialAuthController';
import { authenticateToken } from '@/middleware/auth';
import { validate } from '@/middleware/validation';
import { schemas } from '@/middleware/validation';
import { rateLimiters } from '@/middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  rateLimiters.registration,
  validate(schemas.register),
  register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  rateLimiters.auth,
  validate(schemas.login),
  login
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', resetPassword);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authenticateToken,
  logout
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  authenticateToken,
  getProfile
);

/**
 * @route   POST /api/auth/social
 * @desc    Authenticate with social provider
 * @access  Public
 */
router.post(
  '/social',
  rateLimiters.auth,
  authenticateWithSocial
);

/**
 * @route   GET /api/auth/social/config/:provider
 * @desc    Get social provider configuration
 * @access  Public
 */
router.get(
  '/social/config/:provider',
  getSocialProviderConfig
);

/**
 * @route   POST /api/auth/set-cookies
 * @desc    Set authentication cookies (for migrating from localStorage)
 * @access  Private
 */
router.post(
  '/set-cookies',
  authenticateToken,
  setCookies
);

/**
 * @route   GET /api/auth/csrf-token
 * @desc    Get CSRF token for cookie-based authentication
 * @access  Public
 */
router.get(
  '/csrf-token',
  getCSRFToken
);

export default router;
