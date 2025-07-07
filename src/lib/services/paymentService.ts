import { PrismaClient, Prisma } from '@prisma/client';
import {
  AppointmentStatus,
  Payment,
  PaymentWithAppointment,
  ApiResponse,
  PaymentFilters,
  CreatePaymentRequest,
  PaymentStatus,
} from '../../../shared/domain';

const prisma = new PrismaClient();

export const paymentService = {
  async create(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
    try {
      const payment = await prisma.payment.create({
        data: {
          appointmentId: data.appointmentId,
          amount: data.amount,
          currency: data.currency || 'USD',
          paymentMethod: data.paymentMethod,
          status: PaymentStatus.PENDING,
          provider: 'STRIPE',
        },
      });
      return { success: true, data: payment as unknown as Payment };
    } catch (error) {
      return { success: false, error: 'Failed to create payment' };
    }
  },

  async findById(id: string): Promise<ApiResponse<PaymentWithAppointment | null>> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id },
        include: {
          appointment: {
            include: {
              patient: { include: { user: true } },
              provider: { include: { user: true } },
              consultation: true,
              payment: true,
            },
          },
        },
      });
      return { success: true, data: payment as unknown as PaymentWithAppointment };
    } catch (error) {
      return { success: false, error: 'Failed to find payment' };
    }
  },

  async getById(id: string): Promise<ApiResponse<PaymentWithAppointment | null>> {
    return this.findById(id);
  },

  async findByAppointmentId(appointmentId: string): Promise<ApiResponse<PaymentWithAppointment | null>> {
    try {
      const payment = await prisma.payment.findFirst({
        where: { appointmentId },
        include: {
          appointment: {
            include: {
              patient: { include: { user: true } },
              provider: { include: { user: true } },
              consultation: true,
              payment: true,
            },
          },
        },
      });
      return { success: true, data: payment as unknown as PaymentWithAppointment };
    } catch (error) {
      return { success: false, error: 'Failed to find payment' };
    }
  },

  async getByAppointmentId(appointmentId: string): Promise<ApiResponse<PaymentWithAppointment | null>> {
    return this.findByAppointmentId(appointmentId);
  },

  async findByTransactionId(transactionId: string): Promise<ApiResponse<PaymentWithAppointment | null>> {
    try {
      const payment = await prisma.payment.findFirst({
        where: { reference: transactionId },
        include: {
          appointment: {
            include: {
              patient: { include: { user: true } },
              provider: { include: { user: true } },
              consultation: true,
              payment: true,
            },
          },
        },
      });
      return { success: true, data: payment as unknown as PaymentWithAppointment };
    } catch (error) {
      return { success: false, error: 'Failed to find payment' };
    }
  },

  async getByTransactionId(transactionId: string): Promise<ApiResponse<PaymentWithAppointment | null>> {
    return this.findByTransactionId(transactionId);
  },

  async findMany(filters?: PaymentFilters): Promise<ApiResponse<PaymentWithAppointment[]>> {
    try {
      const where: Prisma.PaymentWhereInput = {};

      if (filters?.status) {
        where.status = { in: Array.isArray(filters.status) ? filters.status : [filters.status] };
      }

      if (filters?.paymentMethod) {
        where.paymentMethod = { in: Array.isArray(filters.paymentMethod) ? filters.paymentMethod : [filters.paymentMethod] };
      }

      const payments = await prisma.payment.findMany({
        where,
        include: {
          appointment: {
            include: {
              patient: { include: { user: true } },
              provider: { include: { user: true } },
              consultation: true,
              payment: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return { success: true, data: payments as unknown as PaymentWithAppointment[] };
    } catch (error) {
      return { success: false, error: 'Failed to find payments' };
    }
  },

  async getAll(): Promise<ApiResponse<PaymentWithAppointment[]>> {
    return this.findMany();
  },

  async update(id: string, data: Partial<CreatePaymentRequest>): Promise<ApiResponse<Payment>> {
    try {
      const payment = await prisma.payment.update({
        where: { id },
        data: {
          ...data,
          paymentMethod: data.paymentMethod,
        },
      });
      return { success: true, data: payment };
    } catch (error) {
      return { success: false, error: 'Failed to update payment' };
    }
  },

  async completePayment(id: string, transactionId: string): Promise<ApiResponse<PaymentWithAppointment>> {
    try {
      const payment = await prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
          where: { id },
          data: {
            status: PaymentStatus.SUCCEEDED,
            reference: transactionId,
          },
          include: {
            appointment: {
              include: {
                patient: { include: { user: true } },
                provider: { include: { user: true } },
                consultation: true,
                payment: true,
              },
            },
          },
        });

        if (updatedPayment.appointment!.status === AppointmentStatus.SCHEDULED) {
          await tx.appointment.update({
            where: { id: updatedPayment.appointmentId },
            data: {
              status: AppointmentStatus.CONFIRMED,
            },
          });
        }

        return updatedPayment;
      });
      return { success: true, data: payment as unknown as PaymentWithAppointment };
    } catch (error) {
      return { success: false, error: 'Failed to complete payment' };
    }
  },

  async failPayment(id: string): Promise<ApiResponse<Payment>> {
    try {
      const payment = await prisma.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.FAILED,
        },
      });
      return { success: true, data: payment };
    } catch (error) {
      return { success: false, error: 'Failed to fail payment' };
    }
  },

  async refundPayment(id: string): Promise<ApiResponse<Payment>> {
    try {
      const payment = await prisma.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.REFUNDED,
        },
      });
      return { success: true, data: payment };
    } catch (error) {
      return { success: false, error: 'Failed to refund payment' };
    }
  },
};

