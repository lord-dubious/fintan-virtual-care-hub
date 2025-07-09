import { apiClient, ApiResponse } from './client';

// Appointment types
export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  scheduledAt: string;
  duration: number;
  consultationType: 'VIDEO' | 'AUDIO';
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reason?: string;
  notes?: string;
  price: number;
  currency: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone?: string;
    };
  };
  provider?: {
    id: string;
    userId: string;
    specialty: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  consultation?: {
    id: string;
    roomUrl: string;
    status: string;
  };
}

export interface AppointmentFilters {
  status?: Appointment['status'];
  consultationType?: Appointment['consultationType'];
  patientId?: string;
  providerId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CreateAppointmentData {
  patientId?: string;
  providerId: string;
  scheduledAt: string;
  duration?: number;
  consultationType: 'VIDEO' | 'AUDIO';
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  scheduledAt?: string;
  duration?: number;
  consultationType?: 'VIDEO' | 'AUDIO';
  status?: Appointment['status'];
  reason?: string;
  notes?: string;
}

export interface AppointmentStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  revenue: number;
  averageRating: number;
}

export interface JoinConsultationResponse {
  sessionId: string;
  appointmentId: string;
  roomUrl: string;
  token: string;
}

// Appointments API
export const appointmentsApi = {
  // Get appointments with optional filters
  async getAppointments(filters?: AppointmentFilters): Promise<ApiResponse<{
    appointments: Appointment[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    return apiClient.get('/appointments', filters);
  },

  // Get appointment by ID
  async getAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.get<Appointment>(`/appointments/${id}`);
  },

  // Create new appointment
  async createAppointment(data: CreateAppointmentData): Promise<ApiResponse<Appointment>> {
    return apiClient.post<Appointment>('/appointments', data);
  },

  // Update appointment
  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<ApiResponse<Appointment>> {
    return apiClient.put<Appointment>(`/appointments/${id}`, data);
  },

  // Cancel appointment
  async cancelAppointment(id: string, reason?: string): Promise<ApiResponse<Appointment>> {
    return apiClient.put<Appointment>(`/appointments/${id}/cancel`, { reason });
  },

  // Reschedule appointment
  async rescheduleAppointment(id: string, newDate: Date): Promise<ApiResponse<Appointment>> {
    return apiClient.put<Appointment>(`/appointments/${id}/reschedule`, {
      scheduledAt: newDate.toISOString()
    });
  },

  // Confirm appointment
  async confirmAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.put<Appointment>(`/appointments/${id}/confirm`);
  },

  // Mark as no-show
  async markNoShow(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.put<Appointment>(`/appointments/${id}/no-show`);
  },

  // Join consultation
  async joinConsultation(appointmentId: string): Promise<ApiResponse<JoinConsultationResponse>> {
    return apiClient.post<JoinConsultationResponse>(`/appointments/${appointmentId}/join`);
  },

  // Get appointment statistics
  async getAppointmentStats(filters?: {
    dateFrom?: string;
    dateTo?: string;
    providerId?: string;
  }): Promise<ApiResponse<AppointmentStats>> {
    return apiClient.get<AppointmentStats>('/appointments/stats', filters);
  },

  // Get upcoming appointments
  async getUpcomingAppointments(limit?: number): Promise<ApiResponse<Appointment[]>> {
    return apiClient.get<Appointment[]>('/appointments/upcoming', { limit });
  },

  // Get past appointments
  async getPastAppointments(limit?: number): Promise<ApiResponse<Appointment[]>> {
    return apiClient.get<Appointment[]>('/appointments/past', { limit });
  },

  // Search appointments
  async searchAppointments(query: string, filters?: AppointmentFilters): Promise<ApiResponse<{
    appointments: Appointment[];
    total: number;
  }>> {
    return apiClient.get('/appointments/search', { query, ...filters });
  },
};

export default appointmentsApi;
