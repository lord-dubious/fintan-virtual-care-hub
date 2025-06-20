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

    let where: any = {};

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
