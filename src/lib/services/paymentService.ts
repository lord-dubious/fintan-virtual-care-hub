// Frontend Payment Service
// This service handles payment functionality using API calls

import {
  Payment,
  PaymentWithAppointment,
  CreatePaymentRequest,
  PaymentFilters,
  ApiResponse,
  PaymentStatus,
} from '../../../shared/domain';
import { apiClient } from '@/api/client';

export const paymentService = {
  async create(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    try {
      const response = await apiClient.post('/api/payments', data);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to create payment' };
    }
  },

  async findById(id: string): Promise<ApiResponse<PaymentWithAppointment | null>> {
    try {
      const response = await apiClient.get(`/api/payments/${id}`);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to find payment' };
    }
  },

  async getById(id: string): Promise<ApiResponse<PaymentWithAppointment | null>> {
    return this.findById(id);
  },

  async findByAppointmentId(appointmentId: string): Promise<ApiResponse<PaymentWithAppointment | null>> {
    try {
      const response = await apiClient.get(`/api/payments/appointment/${appointmentId}`);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to find payment by appointment' };
    }
  },

  async getByAppointmentId(appointmentId: string): Promise<ApiResponse<PaymentWithAppointment | null>> {
    return this.findByAppointmentId(appointmentId);
  },

  async findByTransactionId(transactionId: string): Promise<ApiResponse<PaymentWithAppointment | null>> {
    try {
      const response = await apiClient.get(`/api/payments/transaction/${transactionId}`);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to find payment by transaction ID' };
    }
  },

  async getByTransactionId(transactionId: string): Promise<ApiResponse<PaymentWithAppointment | null>> {
    return this.findByTransactionId(transactionId);
  },

  async findMany(filters?: PaymentFilters): Promise<ApiResponse<PaymentWithAppointment[]>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        statuses.forEach(status => params.append('status', status));
      }
      
      if (filters?.appointmentId) params.append('appointmentId', filters.appointmentId);
      if (filters?.fromDate) params.append('fromDate', filters.fromDate.toISOString());
      if (filters?.toDate) params.append('toDate', filters.toDate.toISOString());
      if (filters?.minAmount) params.append('minAmount', filters.minAmount.toString());
      if (filters?.maxAmount) params.append('maxAmount', filters.maxAmount.toString());

      const response = await apiClient.get(`/api/payments?${params.toString()}`);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to find payments' };
    }
  },

  async getAll(): Promise<ApiResponse<PaymentWithAppointment[]>> {
    return this.findMany();
  },

  async completePayment(id: string, transactionId: string): Promise<ApiResponse<PaymentWithAppointment>> {
    try {
      const response = await apiClient.post(`/api/payments/${id}/complete`, {
        transactionId,
      });
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to complete payment' };
    }
  },

  async updateStatus(id: string, status: PaymentStatus): Promise<ApiResponse<PaymentWithAppointment>> {
    try {
      const response = await apiClient.put(`/api/payments/${id}/status`, {
        status,
      });
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to update payment status' };
    }
  },

  async refund(id: string, reason?: string): Promise<ApiResponse<PaymentWithAppointment>> {
    try {
      const response = await apiClient.post(`/api/payments/${id}/refund`, {
        reason,
      });
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to refund payment' };
    }
  },

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const response = await apiClient.delete(`/api/payments/${id}`);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to delete payment' };
    }
  },

  // Payment intent methods for Stripe/Paystack
  async createPaymentIntent(amount: number, currency: string = 'USD', metadata?: Record<string, any>): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post('/api/payments/intent', {
        amount,
        currency,
        metadata,
      });
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to create payment intent' };
    }
  },

  async confirmPaymentIntent(paymentIntentId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/api/payments/intent/${paymentIntentId}/confirm`);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to confirm payment intent' };
    }
  },

  async cancelPaymentIntent(paymentIntentId: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post(`/api/payments/intent/${paymentIntentId}/cancel`);
      return response;
    } catch (error) {
      return { success: false, error: 'Failed to cancel payment intent' };
    }
  },
};
