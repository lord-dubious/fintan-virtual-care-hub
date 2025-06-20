import Stripe from 'stripe';
import { config } from '@/config';
import logger from '@/config/logger';

// Stripe configuration
export const stripeConfig = {
  secretKey: config.payments.stripe.secretKey,
  webhookSecret: config.payments.stripe.webhookSecret,
  timeout: config.payments.stripe.timeout,
};

// Initialize Stripe client
export const stripe = new Stripe(stripeConfig.secretKey || 'sk_test_mock_key', {
  apiVersion: '2025-05-28.basil',
  timeout: stripeConfig.timeout,
});

// Payment service class
export class PaymentService {
  private stripe: Stripe;
  private isMockMode: boolean;

  constructor() {
    this.stripe = stripe;
    this.isMockMode = !stripeConfig.secretKey || stripeConfig.secretKey.includes('mock') || stripeConfig.secretKey === 'sk_test_your-stripe-secret-key';
  }

  // Create payment intent
  async createPaymentIntent(amount: number, currency: string = 'USD', metadata: any = {}) {
    if (this.isMockMode) {
      // Mock response for development/testing
      return {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_mock`,
        amount: amount * 100, // Stripe uses cents
        currency: currency.toLowerCase(),
        status: 'requires_payment_method',
        metadata,
        created: Math.floor(Date.now() / 1000),
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: currency.toLowerCase(),
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error) {
      logger.error('Stripe payment intent creation failed:', error);
      throw error;
    }
  }

  // Confirm payment intent
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId?: string) {
    if (this.isMockMode) {
      // Mock response for development/testing
      return {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 7500, // Mock amount
        currency: 'usd',
        payment_method: paymentMethodId || 'pm_mock_card',
        created: Math.floor(Date.now() / 1000),
      };
    }

    try {
      const confirmParams: any = {};
      if (paymentMethodId) {
        confirmParams.payment_method = paymentMethodId;
      }

      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        confirmParams
      );

      return paymentIntent;
    } catch (error) {
      logger.error('Stripe payment intent confirmation failed:', error);
      throw error;
    }
  }

  // Retrieve payment intent
  async retrievePaymentIntent(paymentIntentId: string) {
    if (this.isMockMode) {
      // Mock response for development/testing
      return {
        id: paymentIntentId,
        status: 'succeeded',
        amount: 7500,
        currency: 'usd',
        payment_method: 'pm_mock_card',
        created: Math.floor(Date.now() / 1000),
      };
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      logger.error('Stripe payment intent retrieval failed:', error);
      throw error;
    }
  }

  // Create refund
  async createRefund(paymentIntentId: string, amount?: number, reason?: string) {
    if (this.isMockMode) {
      // Mock response for development/testing
      return {
        id: `re_mock_${Date.now()}`,
        payment_intent: paymentIntentId,
        amount: amount ? amount * 100 : 7500,
        currency: 'usd',
        status: 'succeeded',
        reason: reason || 'requested_by_customer',
        created: Math.floor(Date.now() / 1000),
      };
    }

    try {
      const refundParams: any = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundParams.amount = amount * 100; // Convert to cents
      }

      if (reason) {
        refundParams.reason = reason;
      }

      const refund = await this.stripe.refunds.create(refundParams);
      return refund;
    } catch (error) {
      logger.error('Stripe refund creation failed:', error);
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event | null {
    if (this.isMockMode) {
      // Mock webhook event for development/testing
      try {
        const mockEvent = JSON.parse(payload.toString());
        return mockEvent;
      } catch {
        return null;
      }
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        stripeConfig.webhookSecret || 'whsec_mock'
      );
      return event;
    } catch (error) {
      logger.error('Stripe webhook signature verification failed:', error);
      return null;
    }
  }

  // Get payment methods for customer
  async getPaymentMethods(customerId: string) {
    if (this.isMockMode) {
      // Mock response for development/testing
      return {
        data: [
          {
            id: 'pm_mock_card',
            type: 'card',
            card: {
              brand: 'visa',
              last4: '4242',
              exp_month: 12,
              exp_year: 2025,
            },
          },
        ],
      };
    }

    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods;
    } catch (error) {
      logger.error('Stripe payment methods retrieval failed:', error);
      throw error;
    }
  }
}

// Initialize payment service
export const paymentService = new PaymentService();

// Validate payment configuration
export const validatePaymentConfig = () => {
  if (!stripeConfig.secretKey) {
    logger.warn('STRIPE_SECRET_KEY is not configured - using mock mode');
    return false;
  }
  if (!stripeConfig.webhookSecret) {
    logger.warn('STRIPE_WEBHOOK_SECRET is not configured - webhook verification disabled');
    return false;
  }
  return true;
};
