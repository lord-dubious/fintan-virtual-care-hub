
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

export const appointmentService = {
  async createAppointment(params: CreateAppointmentParams) {
    try {
      console.log('Creating appointment with params:', params);
      
      // Mock appointment creation for now
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
      // Mock appointments for now
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
};
