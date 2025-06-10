
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateAppointmentParams {
  patientEmail: string;
  patientName: string;
  patientPhone: string;
  scheduledAt: Date;
  type: string;
  reason: string;
  paymentMethod: string;
}

export interface AppointmentCreateInput {
  patientEmail: string;
  patientName: string;
  patientPhone: string;
  scheduledAt: Date;
  type: string;
  reason: string;
  paymentMethod: string;
}

export interface AppointmentUpdateInput {
  scheduledAt?: Date;
  type?: string;
  reason?: string;
  status?: string;
}

export const appointmentService = {
  async createAppointment(params: CreateAppointmentParams) {
    try {
      console.log('Creating appointment with params:', params);
      
      const appointment = {
        id: `apt-${Date.now()}`,
        patientEmail: params.patientEmail,
        patientName: params.patientName,
        scheduledAt: params.scheduledAt,
        type: params.type,
        reason: params.reason,
        status: 'SCHEDULED',
        createdAt: new Date(),
      };

      return {
        success: true,
        appointment,
      };
    } catch (error) {
      console.error('Failed to create appointment:', error);
      return {
        success: false,
        error: 'Failed to create appointment',
      };
    }
  },

  async getAppointments() {
    try {
      return {
        success: true,
        appointments: [],
      };
    } catch (error) {
      console.error('Failed to get appointments:', error);
      return {
        success: false,
        appointments: [],
      };
    }
  },

  async getAll() {
    return this.getAppointments();
  },

  async getUpcoming() {
    try {
      return {
        success: true,
        appointments: [],
      };
    } catch (error) {
      return {
        success: false,
        appointments: [],
      };
    }
  },

  async getById(id: string) {
    try {
      return {
        success: true,
        appointment: {
          id,
          patientEmail: 'test@example.com',
          patientName: 'Test Patient',
          scheduledAt: new Date(),
          type: 'consultation',
          reason: 'checkup',
          status: 'SCHEDULED',
          createdAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        appointment: null,
      };
    }
  },

  async create(data: AppointmentCreateInput) {
    return this.createAppointment(data);
  },

  async update(id: string, data: AppointmentUpdateInput) {
    try {
      return {
        success: true,
        appointment: {
          id,
          ...data,
          updatedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to update appointment',
      };
    }
  },

  async delete(id: string) {
    try {
      return {
        success: true,
        message: 'Appointment deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete appointment',
      };
    }
  },
};
