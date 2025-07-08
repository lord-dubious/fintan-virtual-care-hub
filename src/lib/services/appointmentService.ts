import { PrismaClient, Prisma } from '@prisma/client';
import { consultationService } from './consultationService';
import { notificationService } from './notificationService';
import {
  AppointmentWithDetails,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  AppointmentStatus,
  Role,
  ApiResponse,
  Consultation,
} from '../../../shared/domain';

const prisma = new PrismaClient();

export const appointmentService = {
  async getUserAppointments(userId: string, role: Role): Promise<ApiResponse<AppointmentWithDetails[]>> {
    try {
      const where: Prisma.AppointmentWhereInput =
        role === Role.PROVIDER ? { provider: { userId } } : { patient: { userId } };

      const appointments = await prisma.appointment.findMany({
        where,
        include: {
          provider: { include: { user: true } },
          patient: { include: { user: true } },
          consultation: true,
          payment: true,
        },
        orderBy: { appointmentDate: 'asc' },
      });

      return { success: true, data: appointments as unknown as AppointmentWithDetails[] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch appointments' };
    }
  },

  async getAppointmentById(appointmentId: string): Promise<ApiResponse<AppointmentWithDetails | null>> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          provider: { include: { user: true } },
          patient: { include: { user: true } },
          consultation: true,
          payment: true,
        },
      });
      return { success: true, data: appointment as unknown as AppointmentWithDetails };
    } catch (error) {
      return { success: false, error: 'Failed to fetch appointment' };
    }
  },

  async createAppointment(params: CreateAppointmentRequest): Promise<ApiResponse<AppointmentWithDetails>> {
    try {
      const appointment = await prisma.appointment.create({
        data: {
          providerId: params.providerId,
          patientId: params.patientId,
          appointmentDate: params.appointmentDate,
          reason: params.reason || '',
          status: AppointmentStatus.SCHEDULED,
          consultationType: params.consultationType,
        },
        include: {
          provider: { include: { user: true } },
          patient: { include: { user: true } },
          consultation: true,
          payment: true,
        },
      });

      await notificationService.notifyAppointmentCreated(appointment.id);
      return { success: true, data: appointment as unknown as AppointmentWithDetails };
    } catch (error) {
      return { success: false, error: 'Failed to create appointment' };
    }
  },

  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<ApiResponse<AppointmentWithDetails>> {
    try {
      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status, updatedAt: new Date() },
        include: {
          provider: { include: { user: true } },
          patient: { include: { user: true } },
          consultation: true,
          payment: true,
        },
      });
      return { success: true, data: appointment as unknown as AppointmentWithDetails };
    } catch (error) {
      return { success: false, error: 'Failed to update appointment status' };
    }
  },

  async cancelAppointment(appointmentId: string): Promise<ApiResponse<AppointmentWithDetails>> {
    try {
      const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.CANCELLED, updatedAt: new Date() },
        include: {
          provider: { include: { user: true } },
          patient: { include: { user: true } },
          consultation: true,
          payment: true,
        },
      });

      return { success: true, data: appointment as unknown as AppointmentWithDetails };
    } catch (error) {
      return { success: false, error: 'Failed to cancel appointment' };
    }
  },

  async joinConsultation(appointmentId: string): Promise<ApiResponse<{ consultation: Consultation }>> {
    try {
      const appointmentResult = await this.getAppointmentById(appointmentId);
      if (!appointmentResult.success || !appointmentResult.data) {
        return { success: false, error: appointmentResult.error || 'Appointment not found' };
      }

      const appointment = appointmentResult.data;

      if (appointment.status !== AppointmentStatus.SCHEDULED) {
        return { success: false, error: `Cannot join consultation. Appointment status is ${appointment.status}` };
      }

      let consultation: Consultation;
      if (appointment.consultation) {
        consultation = appointment.consultation as Consultation;
      } else {
        const consultationResult = await consultationService.createConsultation(appointmentId);
        if (!consultationResult.success || !consultationResult.data) {
          return { success: false, error: consultationResult.error || 'Failed to create consultation' };
        }
        consultation = consultationResult.data;
      }

      await this.updateAppointmentStatus(appointmentId, AppointmentStatus.IN_PROGRESS);

      return { success: true, data: { consultation } };
    } catch (error) {
      return { success: false, error: 'Failed to join consultation' };
    }
  },
};

