
import { consultationService } from './consultationService';
import { notificationService } from './notificationService';

const prisma = {
  appointment: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async (data: any) => ({ id: 'mock-appointment-id', ...data.data }),
    update: async (params: any) => ({ id: params.where.id, ...params.data }),
    delete: async (params: any) => ({ id: params.where.id }),
  },
  consultation: {
    findFirst: async () => null,
  },
};

interface CreateAppointmentParams {
  providerId: string;
  patientId: string;
  appointmentDate: Date;
  reason?: string;
  consultationType: 'VIDEO' | 'AUDIO';
}

export interface AppointmentCreateInput {
  providerId: string;
  patientId: string;
  appointmentDate: Date;
  reason?: string;
  consultationType: 'VIDEO' | 'AUDIO';
}

export interface AppointmentUpdateInput {
  appointmentDate?: Date;
  reason?: string;
  status?: string;
}

export const appointmentService = {
  // Get appointments for a user
  async getUserAppointments(userId: string, role: string): Promise<any[]> {
    return [];
  },

  // Get appointment by ID
  async getAppointmentById(appointmentId: string): Promise<any> {
    return {
      success: false,
      message: 'Appointment not found',
    };
  },

  // Get appointment by ID (alias)
  async getById(appointmentId: string): Promise<any> {
    return this.getAppointmentById(appointmentId);
  },

  // Get all appointments
  async getAll(): Promise<any[]> {
    return [];
  },

  // Get upcoming appointments
  async getUpcoming(): Promise<any[]> {
    return [];
  },

  // Create a new appointment
  async createAppointment(params: CreateAppointmentParams): Promise<any> {
    try {
      const appointment = {
        id: `appointment_${Date.now()}`,
        providerId: params.providerId,
        patientId: params.patientId,
        appointmentDate: params.appointmentDate,
        reason: params.reason || '',
        status: 'SCHEDULED',
        consultationType: params.consultationType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

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

  // Create appointment (alias)
  async create(data: AppointmentCreateInput): Promise<any> {
    return this.createAppointment(data);
  },

  // Update appointment status
  async updateAppointmentStatus(appointmentId: string, status: string): Promise<any> {
    try {
      const appointment = {
        id: appointmentId,
        status,
        updatedAt: new Date(),
      };

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

  // Update appointment
  async update(id: string, data: AppointmentUpdateInput): Promise<any> {
    return this.updateAppointmentStatus(id, data.status || 'SCHEDULED');
  },

  // Cancel appointment
  async cancelAppointment(appointmentId: string): Promise<any> {
    return this.updateAppointmentStatus(appointmentId, 'CANCELLED');
  },

  // Delete appointment
  async delete(id: string): Promise<any> {
    return {
      success: true,
      appointment: { id },
    };
  },

  // Join consultation
  async joinConsultation(appointmentId: string): Promise<any> {
    try {
      const consultation = {
        id: `consultation_${Date.now()}`,
        appointmentId,
        sessionId: `session_${appointmentId}_${Date.now()}`,
        roomUrl: `https://virtualcare.daily.co/${appointmentId}`,
        status: 'IN_PROGRESS',
        startTime: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

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
