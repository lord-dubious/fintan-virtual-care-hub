import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

// Payment types
export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod: 'STRIPE' | 'PAYSTACK' | 'PAYPAL' | 'FLUTTERWAVE';
  transactionId?: string;
  paymentIntentId?: string;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  appointment?: {
    id: string;
    scheduledAt: string;
    consultationType: 'VIDEO' | 'AUDIO';
    patient: {
      user: {
        name: string;
        email: string;
      };
    };
    provider: {
      user: {
        name: string;
      };
    };
  };
}

export interface CreatePaymentData {
  appointmentId: string;
  amount: number;
  currency?: string;
  paymentMethod: 'STRIPE' | 'PAYSTACK' | 'PAYPAL' | 'FLUTTERWAVE';
  metadata?: any;
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
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
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
  async getPaymentHistory(filters?: any): Promise<ApiResponse<{
    payments: Payment[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.HISTORY, filters);
  },
};

export default paymentsApi;
