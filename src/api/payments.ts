import { apiClient, ApiResponse } from './client';

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
    return apiClient.get<Payment>(`/payments/${id}`);
  },

  // Get payment by appointment ID
  async getPaymentByAppointment(appointmentId: string): Promise<ApiResponse<Payment>> {
    return apiClient.get<Payment>(`/payments/appointment/${appointmentId}`);
  },

  // Create payment intent
  async createPaymentIntent(data: CreatePaymentData): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.post<PaymentIntent>('/payments/create-intent', data);
  },

  // Process payment
  async processPayment(data: CreatePaymentData): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>('/payments/process', data);
  },

  // Confirm payment
  async confirmPayment(paymentId: string, transactionId: string): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(`/payments/${paymentId}/confirm`, { transactionId });
  },

  // Refund payment
  async refundPayment(data: RefundData): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(`/payments/${data.paymentId}/refund`, {
      amount: data.amount,
      reason: data.reason
    });
  },

  // Get payment method configuration
  async getPaymentMethodConfig(): Promise<ApiResponse<PaymentMethodConfig>> {
    return apiClient.get<PaymentMethodConfig>('/payments/config');
  },

  // Get payment history
  async getPaymentHistory(filters?: {
    status?: Payment['status'];
    paymentMethod?: Payment['paymentMethod'];
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    payments: Payment[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    return apiClient.get('/payments', filters);
  },

  // Stripe specific methods
  stripe: {
    async createPaymentIntent(appointmentId: string, amount: number): Promise<ApiResponse<{
      clientSecret: string;
      paymentIntentId: string;
    }>> {
      return apiClient.post('/payments/stripe/create-intent', {
        appointmentId,
        amount
      });
    },

    async confirmPayment(paymentIntentId: string): Promise<ApiResponse<Payment>> {
      return apiClient.post('/payments/stripe/confirm', { paymentIntentId });
    },

    async createSetupIntent(customerId?: string): Promise<ApiResponse<{
      clientSecret: string;
      setupIntentId: string;
    }>> {
      return apiClient.post('/payments/stripe/setup-intent', { customerId });
    },
  },

  // Paystack specific methods
  paystack: {
    async initializePayment(appointmentId: string, amount: number, email: string): Promise<ApiResponse<{
      authorizationUrl: string;
      accessCode: string;
      reference: string;
    }>> {
      return apiClient.post('/payments/paystack/initialize', {
        appointmentId,
        amount,
        email
      });
    },

    async verifyPayment(reference: string): Promise<ApiResponse<Payment>> {
      return apiClient.get(`/payments/paystack/verify/${reference}`);
    },
  },

  // PayPal specific methods
  paypal: {
    async createOrder(appointmentId: string, amount: number): Promise<ApiResponse<{
      orderId: string;
      approvalUrl: string;
    }>> {
      return apiClient.post('/payments/paypal/create-order', {
        appointmentId,
        amount
      });
    },

    async captureOrder(orderId: string): Promise<ApiResponse<Payment>> {
      return apiClient.post(`/payments/paypal/capture/${orderId}`);
    },
  },

  // Flutterwave specific methods
  flutterwave: {
    async initializePayment(appointmentId: string, amount: number, email: string): Promise<ApiResponse<{
      paymentLink: string;
      transactionId: string;
    }>> {
      return apiClient.post('/payments/flutterwave/initialize', {
        appointmentId,
        amount,
        email
      });
    },

    async verifyPayment(transactionId: string): Promise<ApiResponse<Payment>> {
      return apiClient.get(`/payments/flutterwave/verify/${transactionId}`);
    },
  },
};

export default paymentsApi;
