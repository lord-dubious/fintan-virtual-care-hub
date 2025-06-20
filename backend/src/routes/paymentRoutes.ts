import { Router } from 'express';
import {
  createPaymentIntent,
  confirmPayment,
  getPayment,
  getPayments,
  handleStripeWebhook
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
