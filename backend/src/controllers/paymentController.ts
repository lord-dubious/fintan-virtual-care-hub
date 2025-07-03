import { Response } from 'express';
import { prisma } from '@/config/database';
import { paymentService } from '@/config/payment';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';

/**
 * Create payment intent for appointment
 * POST /api/payments/intent
 */
export const createPaymentIntent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { appointmentId } = req.body;

    if (!appointmentId) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
      return;
    }

    // Fetch appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: {
          include: { user: true }
        },
        provider: {
          include: { user: true }
        },
        payment: true,
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
      return;
    }

    // Check authorization - only patient can create payment intent
    if (req.user.role !== 'PATIENT' || appointment.patient.user.id !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Only the patient can create payment for this appointment',
      });
      return;
    }

    // Check if payment already exists
    if (appointment.payment) {
      res.status(400).json({
        success: false,
        error: 'Payment already exists for this appointment',
        data: { payment: appointment.payment },
      });
      return;
    }

    // Get consultation fee from provider
    const consultationFee = parseFloat(appointment.provider.consultationFee?.toString() || '0');

    if (consultationFee <= 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid consultation fee',
      });
      return;
    }

    // Create payment intent with Stripe
    const paymentIntent = await paymentService.createPaymentIntent(
      consultationFee,
      'USD',
      {
        appointmentId,
        patientId: appointment.patientId,
        providerId: appointment.providerId,
        patientEmail: appointment.patient.user.email,
        providerName: appointment.provider.user.name,
      }
    );

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        patientId: appointment.patientId,
        appointmentId,
        amount: consultationFee,
        currency: 'USD',
        status: 'PENDING',
        paymentMethod: 'STRIPE',
        paymentIntentId: paymentIntent.id,
        metadata: {
          clientSecret: paymentIntent.client_secret,
          stripePaymentIntentId: paymentIntent.id,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        payment,
        clientSecret: paymentIntent.client_secret,
        amount: consultationFee,
        currency: 'USD',
      },
      message: 'Payment intent created successfully',
    });
  } catch (error) {
    logger.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent',
    });
  }
};

/**
 * Confirm payment
 * POST /api/payments/confirm
 */
export const confirmPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { paymentId, paymentMethodId } = req.body;

    if (!paymentId) {
      res.status(400).json({
        success: false,
        error: 'Payment ID is required',
      });
      return;
    }

    // Fetch payment record
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        patient: {
          include: { user: true }
        },
        appointment: true,
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
      return;
    }

    // Check authorization
    if (req.user.role !== 'PATIENT' || payment.patient.user.id !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Check if payment is already completed
    if (payment.status === 'COMPLETED') {
      res.status(400).json({
        success: false,
        error: 'Payment is already completed',
        data: { payment },
      });
      return;
    }

    // Confirm payment with Stripe
    const confirmedPayment = await paymentService.confirmPaymentIntent(
      payment.paymentIntentId!,
      paymentMethodId
    );

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: confirmedPayment.status === 'succeeded' ? 'COMPLETED' : 'FAILED',
        transactionId: confirmedPayment.id,
        metadata: {
          ...payment.metadata as any,
          stripeStatus: confirmedPayment.status,
          paymentMethod: confirmedPayment.payment_method,
        },
      },
    });

    // If payment successful, update appointment status
    if (confirmedPayment.status === 'succeeded') {
      await prisma.appointment.update({
        where: { id: payment.appointmentId! },
        data: { status: 'CONFIRMED' },
      });
    }

    res.json({
      success: true,
      data: {
        payment: updatedPayment,
        stripeStatus: confirmedPayment.status,
      },
      message: confirmedPayment.status === 'succeeded' 
        ? 'Payment confirmed successfully' 
        : 'Payment confirmation failed',
    });
  } catch (error) {
    logger.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment',
    });
  }
};

/**
 * Get payment details
 * GET /api/payments/:id
 */
export const getPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Payment ID is required',
      });
      return;
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        patient: {
          include: { user: true }
        },
        appointment: {
          include: {
            provider: {
              include: { user: true }
            }
          }
        },
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && payment.patient?.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && payment.appointment?.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    res.json({
      success: true,
      data: { payment },
    });
  } catch (error) {
    logger.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment',
    });
  }
};

/**
 * Get user's payments
 * GET /api/payments
 */
export const getPayments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (req.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!patient) {
        res.status(404).json({
          success: false,
          error: 'Patient profile not found',
        });
        return;
      }

      where.patientId = patient.id;
    } else if (req.user.role === 'PROVIDER') {
      // For providers, get payments for their appointments
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!provider) {
        res.status(404).json({
          success: false,
          error: 'Provider profile not found',
        });
        return;
      }

      where.appointment = {
        providerId: provider.id,
      };
    }

    if (status) {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          appointment: {
            select: {
              id: true,
              appointmentDate: true,
              reason: true,
              status: true,
              provider: {
                select: {
                  id: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Get payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payments',
    });
  }
};

/**
 * Handle Stripe webhook events
 * POST /api/payments/webhook
 */
export const handleStripeWebhook = async (req: any, res: Response): Promise<void> => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      res.status(400).json({
        success: false,
        error: 'Missing stripe signature',
      });
      return;
    }

    // Verify webhook signature
    const event = paymentService.verifyWebhookSignature(req.body, signature);

    if (!event) {
      res.status(400).json({
        success: false,
        error: 'Invalid webhook signature',
      });
      return;
    }

    logger.info('Stripe webhook event received:', { type: event.type, id: event.id });

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as any);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as any);
        break;
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object as any);
        break;
      default:
        logger.info('Unhandled webhook event type:', event.type);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed',
    });
  }
};

// Helper function to handle successful payment
async function handlePaymentSucceeded(paymentIntent: any) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId: paymentIntent.id },
      include: { appointment: true },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'COMPLETED',
          transactionId: paymentIntent.id,
        },
      });

      // Update appointment status to confirmed
      if (payment.appointmentId) {
        await prisma.appointment.update({
          where: { id: payment.appointmentId },
          data: { status: 'CONFIRMED' },
        });
      }

      logger.info('Payment succeeded and records updated:', { paymentId: payment.id });
    }
  } catch (error) {
    logger.error('Error handling payment succeeded:', error);
  }
}

// Helper function to handle failed payment
async function handlePaymentFailed(paymentIntent: any) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED' },
      });

      logger.info('Payment failed and records updated:', { paymentId: payment.id });
    }
  } catch (error) {
    logger.error('Error handling payment failed:', error);
  }
}

// Helper function to handle canceled payment
async function handlePaymentCanceled(paymentIntent: any) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'CANCELLED' },
      });

      logger.info('Payment canceled and records updated:', { paymentId: payment.id });
    }
  } catch (error) {
    logger.error('Error handling payment canceled:', error);
  }
}

/**
 * Create checkout session for payment
 * POST /api/payments/create-checkout-session
 */
export const createCheckoutSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { appointmentId, paymentMethod = 'STRIPE', amount, currency = 'USD' } = req.body;

    if (!appointmentId) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
      return;
    }

    // Fetch appointment details
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: { include: { user: true } },
        provider: { include: { user: true } },
        payment: true,
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
      return;
    }

    // Check authorization
    if (req.user.role === 'PATIENT' && appointment.patient?.user.id !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Check if payment already exists
    if (appointment.payment) {
      res.status(400).json({
        success: false,
        error: 'Payment already exists for this appointment',
      });
      return;
    }

    const consultationFee = amount || parseFloat(appointment.provider.consultationFee?.toString() || '0');

    if (consultationFee <= 0) {
      res.status(400).json({
        success: false,
        error: 'Invalid consultation fee',
      });
      return;
    }

    if (paymentMethod === 'STRIPE') {
      // Create Stripe payment intent
      const paymentIntent = await paymentService.createPaymentIntent(
        consultationFee,
        currency,
        {
          appointmentId,
          patientId: appointment.patientId,
          providerId: appointment.providerId,
          patientEmail: appointment.patient.user.email,
          providerName: appointment.provider.user.name,
        }
      );

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          patientId: appointment.patientId,
          appointmentId,
          amount: consultationFee,
          currency,
          status: 'PENDING',
          paymentMethod: 'STRIPE',
          paymentIntentId: paymentIntent.id,
          metadata: {
            clientSecret: paymentIntent.client_secret,
            stripePaymentIntentId: paymentIntent.id,
          },
        },
      });

      res.status(201).json({
        success: true,
        data: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: consultationFee,
          currency,
          payment,
        },
        message: 'Checkout session created successfully',
      });
    } else {
      // For other payment methods (Paystack, etc.), return mock response
      res.status(201).json({
        success: true,
        data: {
          authorizationUrl: `https://checkout.paystack.com/mock-${Date.now()}`,
          reference: `ref_${Date.now()}`,
          amount: consultationFee,
          currency,
        },
        message: 'Checkout session created successfully',
      });
    }
  } catch (error) {
    logger.error('Create checkout session error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create checkout session',
    });
  }
};

/**
 * Verify payment with provider
 * GET /api/payments/verify/:provider/:reference
 */
export const verifyPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { provider, reference } = req.params;

    if (!provider || !reference) {
      res.status(400).json({
        success: false,
        error: 'Provider and reference are required',
      });
      return;
    }

    // Find payment by reference or payment intent ID
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { paymentIntentId: reference },
          { transactionId: reference },
          { metadata: { path: ['reference'], equals: reference } },
        ],
      },
      include: {
        appointment: {
          include: {
            patient: { include: { user: true } },
            provider: { include: { user: true } },
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && payment.appointment?.patient?.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && payment.appointment?.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Verify payment with provider
    let verificationResult;
    if (provider.toUpperCase() === 'STRIPE' && payment.paymentIntentId) {
      try {
        const paymentIntent = await paymentService.retrievePaymentIntent(payment.paymentIntentId);
        verificationResult = {
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100, // Convert from cents
          currency: paymentIntent.currency,
          verified: paymentIntent.status === 'succeeded',
        };

        // Update payment status if needed
        if (paymentIntent.status === 'succeeded' && payment.status !== 'COMPLETED') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'COMPLETED' },
          });
        }
      } catch (error) {
        logger.error('Stripe verification error:', error);
        verificationResult = {
          status: 'failed',
          verified: false,
          error: 'Verification failed',
        };
      }
    } else {
      // For other providers, return mock verification
      verificationResult = {
        status: 'success',
        verified: true,
        amount: payment.amount,
        currency: payment.currency,
      };
    }

    res.json({
      success: true,
      data: {
        payment,
        verification: verificationResult,
      },
      message: 'Payment verification completed',
    });
  } catch (error) {
    logger.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment',
    });
  }
};

/**
 * Refund payment
 * POST /api/payments/:id/refund
 */
export const refundPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;
    const { amount, reason } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Payment ID is required',
      });
      return;
    }

    // Find payment
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        appointment: {
          include: {
            patient: { include: { user: true } },
            provider: { include: { user: true } },
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        error: 'Payment not found',
      });
      return;
    }

    // Check authorization
    const isProvider = req.user.role === 'PROVIDER' && payment.appointment?.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Check if payment can be refunded
    if (payment.status !== 'COMPLETED') {
      res.status(400).json({
        success: false,
        error: 'Only completed payments can be refunded',
      });
      return;
    }

    // Create refund
    let refund;
    if (payment.paymentMethod === 'STRIPE' && payment.paymentIntentId) {
      try {
        refund = await paymentService.createRefund(
          payment.paymentIntentId,
          amount ? amount * 100 : undefined, // Convert to cents
          reason
        );

        // Update payment record
        await prisma.payment.update({
          where: { id },
          data: {
            status: 'REFUNDED',
            metadata: {
              ...payment.metadata as any,
              refundId: refund.id,
              refundAmount: amount || payment.amount,
              refundReason: reason,
            },
          },
        });
      } catch (error) {
        logger.error('Stripe refund error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to process refund',
        });
        return;
      }
    } else {
      // For other payment methods, create mock refund
      refund = {
        id: `refund_mock_${Date.now()}`,
        amount: (amount || payment.amount) * 100,
        currency: payment.currency,
        status: 'succeeded',
        reason: reason || 'requested_by_customer',
      };

      await prisma.payment.update({
        where: { id },
        data: {
          status: 'REFUNDED',
          metadata: {
            ...payment.metadata as any,
            refundId: refund.id,
            refundAmount: amount || payment.amount,
            refundReason: reason,
          },
        },
      });
    }

    res.json({
      success: true,
      data: {
        refund,
        payment: await prisma.payment.findUnique({ where: { id } }),
      },
      message: 'Payment refunded successfully',
    });
  } catch (error) {
    logger.error('Refund payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refund payment',
    });
  }
};

/**
 * Get payment configuration
 * GET /api/payments/config
 */
export const getPaymentConfig = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const config = {
      stripe: {
        enabled: !!process.env['STRIPE_PUBLISHABLE_KEY'],
        publishableKey: process.env['STRIPE_PUBLISHABLE_KEY'],
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
      },
      paystack: {
        enabled: !!process.env['PAYSTACK_PUBLIC_KEY'],
        publicKey: process.env['PAYSTACK_PUBLIC_KEY'],
        supportedCurrencies: ['NGN', 'USD', 'GHS', 'ZAR'],
      },
      paypal: {
        enabled: !!process.env['PAYPAL_CLIENT_ID'],
        clientId: process.env['PAYPAL_CLIENT_ID'],
        supportedCurrencies: ['USD', 'EUR', 'GBP'],
      },
      flutterwave: {
        enabled: !!process.env['FLUTTERWAVE_PUBLIC_KEY'],
        publicKey: process.env['FLUTTERWAVE_PUBLIC_KEY'],
        supportedCurrencies: ['NGN', 'USD', 'EUR', 'GBP'],
      },
    };

    res.json({
      success: true,
      data: config,
      message: 'Payment configuration retrieved successfully',
    });
  } catch (error) {
    logger.error('Get payment config error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment configuration',
    });
  }
};

/**
 * Get payment history
 * GET /api/payments/history
 */
export const getPaymentHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { page = '1', limit = '10', status, paymentMethod } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause based on user role
    const where: any = {};

    if (req.user.role === 'PATIENT') {
      where.appointment = {
        patient: {
          user: { id: req.user.id },
        },
      };
    } else if (req.user.role === 'PROVIDER') {
      where.appointment = {
        provider: {
          user: { id: req.user.id },
        },
      };
    }
    // Admin can see all payments (no additional where clause)

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          appointment: {
            include: {
              patient: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
              provider: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: 'Payment history retrieved successfully',
    });
  } catch (error) {
    logger.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment history',
    });
  }
};

/**
 * Get invoices
 * GET /api/payments/invoices
 */
export const getInvoices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { page = '1', limit = '10', status } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause based on user role
    const where: any = {
      status: 'COMPLETED', // Only show invoices for completed payments
    };

    if (req.user.role === 'PATIENT') {
      where.appointment = {
        patient: {
          user: { id: req.user.id },
        },
      };
    } else if (req.user.role === 'PROVIDER') {
      where.appointment = {
        provider: {
          user: { id: req.user.id },
        },
      };
    }
    // Admin can see all invoices (no additional where clause)

    if (status && status !== 'all') {
      where.status = status;
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          appointment: {
            include: {
              patient: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
              provider: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.payment.count({ where }),
    ]);

    // Transform payments into invoice format
    const invoices = payments.map(payment => ({
      id: payment.id,
      invoiceNumber: `INV-${payment.id.slice(-8).toUpperCase()}`,
      date: payment.createdAt,
      dueDate: payment.createdAt,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      patient: {
        name: payment.appointment?.patient.user.name || 'Unknown',
        email: payment.appointment?.patient.user.email || 'unknown@example.com',
      },
      provider: {
        name: payment.appointment?.provider.user.name || 'Unknown',
      },
      appointment: {
        id: payment.appointment?.id || '',
        scheduledAt: payment.appointment?.appointmentDate || payment.createdAt,
        consultationType: payment.appointment?.consultationType || 'VIDEO',
      },
      lineItems: [
        {
          description: `${payment.appointment?.consultationType || 'VIDEO'} Consultation`,
          quantity: 1,
          unitPrice: payment.amount,
          total: payment.amount,
        },
      ],
      subtotal: payment.amount,
      tax: 0,
      total: payment.amount,
    }));

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
      message: 'Invoices retrieved successfully',
    });
  } catch (error) {
    logger.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get invoices',
    });
  }
};
