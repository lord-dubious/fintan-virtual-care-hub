
// Mock implementation for frontend-only demo
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
    // Mock implementation
    return [];
  },

  // Get appointment by ID
  async getAppointmentById(appointmentId: string): Promise<any> {
    return {
      success: false,
      message: 'Mock implementation - appointment not found',
    };
  },

  // Create a new appointment
  async createAppointment(params: CreateAppointmentParams): Promise<any> {
    return {
      success: true,
      appointment: {
        id: `appointment_${Date.now()}`,
        ...params,
        status: 'SCHEDULED',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  },

  // Update appointment status
  async updateAppointmentStatus(appointmentId: string, status: string): Promise<any> {
    return {
      success: true,
      appointment: {
        id: appointmentId,
        status,
        updatedAt: new Date(),
      },
    };
  },

  // Cancel appointment
  async cancelAppointment(appointmentId: string): Promise<any> {
    return {
      success: true,
      appointment: {
        id: appointmentId,
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    };
  },

  // Join consultation
  async joinConsultation(appointmentId: string): Promise<any> {
    return {
      success: true,
      consultation: {
        id: `consultation_${appointmentId}`,
        appointmentId,
        roomUrl: `https://virtualcare.daily.co/${appointmentId}`,
        status: 'IN_PROGRESS',
      },
    };
  },

  // Mock methods expected by hooks
  async getAll(): Promise<any[]> {
    return [];
  },

  async getUpcoming(): Promise<any[]> {
    return [];
  },

  async getById(id: string): Promise<any> {
    return this.getAppointmentById(id);
  },

  async create(data: AppointmentCreateInput): Promise<any> {
    return this.createAppointment(data);
  },

  async update(id: string, data: AppointmentUpdateInput): Promise<any> {
    return {
      success: true,
      appointment: {
        id,
        ...data,
        updatedAt: new Date(),
      },
    };
  },

  async delete(id: string): Promise<any> {
    return this.cancelAppointment(id);
  },
};
