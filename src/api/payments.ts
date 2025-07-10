import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
// import { PaymentSchema, CreatePaymentSchema, PaymentIntentSchema } from '@/lib/validation/schemas';
// import type { Payment, CreatePaymentData } from '@/lib/validation/schemas';
// import { PaymentStatus, PaymentMethod } from '@/lib/types/enums';

// Define Payment types locally for API use
export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  reference?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentData {
  appointmentId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
}

export interface PaymentMethodConfig {
  stripe: {
    enabled: boolean;
    publishableKey?: string;
    supportedCurrencies: string[];
  };
  paystack: {
    enabled: boolean;
    publicKey?: string;
    supportedCurrencies: string[];
  };
  paypal: {
    enabled: boolean;
    clientId?: string;
    supportedCurrencies: string[];
  };
  flutterwave: {
    enabled: boolean;
    publicKey?: string;
    supportedCurrencies: string[];
  };
}

export interface PaymentIntent {
  id: string; // Stripe payment intent id
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

// Server response when creating a payment intent – includes DB record and Stripe clientSecret
export interface CreatePaymentIntentResponse {
  payment: Payment;
  clientSecret: string;
}

export interface RefundData {
  paymentId: string;
  amount?: number;
  reason?: string;
}

// Payments API
export const paymentsApi = {
  // Get payment by ID
  async getPayment(id: string): Promise<ApiResponse<Payment>> {
    return apiClient.get<Payment>(`${API_ENDPOINTS.PAYMENTS.BASE}/${id}`);
  },

  // Get payment by appointment ID
  async getPaymentByAppointment(appointmentId: string): Promise<ApiResponse<Payment>> {
    return apiClient.get<Payment>(`${API_ENDPOINTS.PAYMENTS.BASE}/appointment/${appointmentId}`);
  },

  // Create payment intent (Stripe)
  async createPaymentIntent(data: CreatePaymentData): Promise<ApiResponse<CreatePaymentIntentResponse>> {
    return apiClient.post(API_ENDPOINTS.PAYMENTS.INTENT, data);
  },

  // Confirm payment (update DB after Stripe success)
  async confirmPayment(paymentId: string, paymentMethodId?: string): Promise<ApiResponse<Payment>> {
    return apiClient.post(API_ENDPOINTS.PAYMENTS.CONFIRM, { paymentId, paymentMethodId });
  },

  // Create a checkout session for a payment provider
  async createCheckoutSession(data: CreatePaymentData): Promise<ApiResponse<PaymentIntent | { authorizationUrl: string; reference: string; }>> {
    return apiClient.post(API_ENDPOINTS.PAYMENTS.CREATE_SESSION, data);
  },

  // Verify a payment after completion
  async verifyPayment(provider: string, reference: string): Promise<ApiResponse<Payment>> {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.VERIFY(provider, reference));
  },

  // Refund payment
  async refundPayment(data: RefundData): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(API_ENDPOINTS.PAYMENTS.REFUND(data.paymentId), { amount: data.amount, reason: data.reason });
  },

  // Get payment method configuration
  async getPaymentMethodConfig(): Promise<ApiResponse<PaymentMethodConfig>> {
    return apiClient.get<PaymentMethodConfig>(API_ENDPOINTS.PAYMENTS.CONFIG);
  },

  // Get payment history
  async getPaymentHistory(filters?: { status?: string; dateFrom?: string; dateTo?: string; userId?: string }): Promise<ApiResponse<{
    payments: Payment[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.HISTORY, filters);
  },
};

export default paymentsApi;
