import { Router } from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPayment,
  getPayments,
  handleStripeWebhook,
  createCheckoutSession,
  verifyPayment,
  refundPayment,
  getPaymentConfig,
  getPaymentHistory,
  getInvoices
} from '@/controllers/paymentController';
import { authenticateToken, authorizeRoles } from '@/middleware/auth';

const router = Router();

/**
 * @route   POST /api/payments/intent
 * @desc    Create payment intent for appointment
 * @access  Private (Patient only)
 */
router.post(
  '/intent',
  authenticateToken,
  authorizeRoles('PATIENT'),
  createPaymentIntent
);

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirm payment
 * @access  Private (Patient only)
 */
router.post(
  '/confirm',
  authenticateToken,
  authorizeRoles('PATIENT'),
  confirmPayment
);

/**
 * @route   POST /api/payments/create-checkout-session
 * @desc    Create checkout session for payment
 * @access  Private (Patient only)
 */
router.post(
  '/create-checkout-session',
  authenticateToken,
  authorizeRoles('PATIENT'),
  createCheckoutSession
);

/**
 * @route   GET /api/payments/verify/:provider/:reference
 * @desc    Verify payment with provider
 * @access  Private
 */
router.get(
  '/verify/:provider/:reference',
  authenticateToken,
  verifyPayment
);

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Refund payment
 * @access  Private (Admin, Provider)
 */
router.post(
  '/:id/refund',
  authenticateToken,
  authorizeRoles('ADMIN', 'PROVIDER'),
  refundPayment
);

/**
 * @route   GET /api/payments/config
 * @desc    Get payment configuration
 * @access  Private
 */
router.get(
  '/config',
  authenticateToken,
  getPaymentConfig
);

/**
 * @route   GET /api/payments/history
 * @desc    Get payment history
 * @access  Private
 */
router.get(
  '/history',
  authenticateToken,
  getPaymentHistory
);

/**
 * @route   GET /api/payments/invoices
 * @desc    Get invoices
 * @access  Private
 */
router.get(
  '/invoices',
  authenticateToken,
  getInvoices
);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment details
 * @access  Private (Patient, Provider, Admin)
 */
router.get(
  '/:id',
  authenticateToken,
  getPayment
);

/**
 * @route   GET /api/payments
 * @desc    Get user's payments
 * @access  Private
 */
router.get(
  '/',
  authenticateToken,
  getPayments
);

/**
 * @route   POST /api/payments/webhook
 * @desc    Handle Stripe webhook events
 * @access  Public (Stripe webhook)
 */
router.post(
  '/webhook',
  handleStripeWebhook
);

export default router;
