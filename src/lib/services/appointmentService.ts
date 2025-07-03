import { PrismaClient } from '@prisma/client';
import { consultationService } from './consultationService';
import { notificationService } from './notificationService';

const prisma = new PrismaClient();

interface CreateAppointmentParams {
  providerId: string;
  patientId: string;
  appointmentDate: Date;
  reason?: string;
  consultationType: 'VIDEO' | 'AUDIO';
}

// Return types for appointment service - using unknown for complex Prisma types
type AppointmentWithDetails = unknown;

export const appointmentService = {
  // Get appointments for a user
  async getUserAppointments(userId: string, role: string): Promise<AppointmentWithDetails[]> {
    try {
      const where = role === 'PROVIDER'
        ? { provider: { userId } }
        : { patient: { userId } };

      const appointments = await prisma.appointment.findMany({
        where,
        include: {
          provider: {
            include: {
              user: true,
            },
          },
          patient: {
            include: {
              user: true,
            },
          },
          consultation: true,
        },
        orderBy: {
          appointmentDate: 'asc',
        },
      });

      return appointments;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },

  // Get appointment by ID
  async getAppointmentById(appointmentId: string): Promise<AppointmentWithDetails | null> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          provider: {
            include: {
              user: true,
            },
          },
          patient: {
            include: {
              user: true,
            },
          },
          consultation: true,
        },
      });

      if (!appointment) {
        return {
          success: false,
          message: 'Appointment not found',
        };
      }

      return {
        success: true,
        appointment,
      };
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return {
        success: false,
        message: 'Failed to fetch appointment',
      };
    }
  },

  // Create a new appointment
  async createAppointment(params: CreateAppointmentParams): Promise<AppointmentWithDetails> {
    try {
      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          providerId: params.providerId,
          patientId: params.patientId,
          appointmentDate: params.appointmentDate,
          reason: params.reason || '',
          status: 'SCHEDULED',
          consultationType: params.consultationType,
        },
      });

      // Send notifications
      await notificationService.notifyAppointmentCreated(appointment.id);

      return {
        success: true,
        appointment,
      };
    } catch (error) {
      console.error('Error creating appointment:', error);
      return {
        success: false,
        message: 'Failed to create appointment',
      };
    }
  },

  // Update appointment status
  async updateAppointmentStatus(appointmentId: string, status: string): Promise<unknown> {
    try {
      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        appointment,
      };
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return {
        success: false,
        message: 'Failed to update appointment status',
      };
    }
  },

  // Cancel appointment
  async cancelAppointment(appointmentId: string): Promise<unknown> {
    try {
      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
      });

      // TODO: Send cancellation notifications

      return {
        success: true,
        appointment,
      };
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return {
        success: false,
        message: 'Failed to cancel appointment',
      };
    }
  },

  // Join consultation
  async joinConsultation(appointmentId: string): Promise<unknown> {
    try {
      // Get appointment
      const appointmentResult = await this.getAppointmentById(appointmentId);
      if (!appointmentResult.success) {
        return appointmentResult;
      }

      const appointment = appointmentResult.appointment;

      // Check if appointment is scheduled
      if (appointment.status !== 'SCHEDULED') {
        return {
          success: false,
          message: `Cannot join consultation. Appointment status is ${appointment.status}`,
        };
      }

      // Create or get consultation
      let consultation;
      if (appointment.consultation) {
        consultation = appointment.consultation;
      } else {
        const consultationResult = await consultationService.createConsultation(appointmentId);
        if (!consultationResult.success) {
          return consultationResult;
        }
        consultation = consultationResult.consultation;
      }

      // Update appointment status to IN_PROGRESS
      await this.updateAppointmentStatus(appointmentId, 'IN_PROGRESS');

      return {
        success: true,
        consultation,
      };
    } catch (error) {
      console.error('Error joining consultation:', error);
      return {
        success: false,
        message: 'Failed to join consultation',
      };
    }
  },
};

