import { PrismaClient } from '@prisma/client';
import { Payment, PaymentMethod, PaymentStatus } from '../../types/prisma';

const prisma = new PrismaClient();

export interface PaymentCreateInput {
  appointmentId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  status?: PaymentStatus;
}

export interface PaymentUpdateInput {
  amount?: number;
  currency?: string;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  status?: PaymentStatus;
}

export const paymentService = {
  async create(data: PaymentCreateInput): Promise<Payment> {
    return prisma.payment.create({
      data: {
        appointmentId: data.appointmentId,
        amount: data.amount,
        currency: data.currency || 'USD',
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        status: data.status || PaymentStatus.PENDING,
      },
    });
  },

  async findById(id: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        appointment: true,
      },
    });
  },

  async getById(id: string): Promise<Payment | null> {
    return this.findById(id);
  },

  async findByAppointmentId(appointmentId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: { appointmentId },
    });
  },

  async getByAppointmentId(appointmentId: string): Promise<Payment | null> {
    return this.findByAppointmentId(appointmentId);
  },

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    return prisma.payment.findFirst({
      where: { transactionId },
      include: {
        appointment: true,
      },
    });
  },

  async getByTransactionId(transactionId: string): Promise<Payment | null> {
    return this.findByTransactionId(transactionId);
  },

  async findMany(filters?: {
    status?: PaymentStatus;
    paymentMethod?: PaymentMethod;
  }): Promise<Payment[]> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    return prisma.payment.findMany({
      where,
      include: {
        appointment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async getAll(): Promise<Payment[]> {
    return this.findMany();
  },

  async update(id: string, data: PaymentUpdateInput): Promise<Payment> {
    return prisma.payment.update({
      where: { id },
      data,
    });
  },

  async completePayment(id: string, transactionId: string): Promise<Payment> {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId,
        },
        include: {
          appointment: true,
        },
      });

      // Update appointment status if it's pending
      if (payment.appointment.status === 'SCHEDULED') {
        await tx.appointment.update({
          where: { id: payment.appointmentId },
          data: {
            status: 'CONFIRMED',
          },
        });
      }

      return payment;
    });
  },

  async failPayment(id: string, reason?: string): Promise<Payment> {
    return prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.FAILED,
      },
    });
  },

  async refundPayment(id: string): Promise<Payment> {
    return prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.REFUNDED,
      },
    });
  },
};
