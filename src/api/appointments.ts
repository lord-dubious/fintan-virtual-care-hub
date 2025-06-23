import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

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
  startDate?: Date | string;
  endDate?: Date | string;
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
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.BASE, filters);
  },

  // Get appointment by ID
  async getAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.get<Appointment>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}`);
  },

  // Create new appointment
  async createAppointment(data: CreateAppointmentData): Promise<ApiResponse<Appointment>> {
    return apiClient.post<Appointment>(API_ENDPOINTS.APPOINTMENTS.BASE, data);
  },

  // Update appointment
  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<ApiResponse<Appointment>> {
    return apiClient.put<Appointment>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}`, data);
  },

  // Update appointment status
  async updateAppointmentStatus(id: string, status: Appointment['status'], notes?: string): Promise<ApiResponse<Appointment>> {
    return apiClient.put<Appointment>(API_ENDPOINTS.APPOINTMENTS.STATUS(id), { status, notes });
  },

  // Cancel appointment
  async cancelAppointment(id: string, reason?: string): Promise<ApiResponse<Appointment>> {
    return apiClient.put<Appointment>(API_ENDPOINTS.APPOINTMENTS.CANCEL(id), { reason });
  },

  // Reschedule appointment
  async rescheduleAppointment(id: string, newDate: Date): Promise<ApiResponse<Appointment>> {
    return apiClient.put<Appointment>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}/reschedule`, {
      scheduledAt: newDate.toISOString()
    });
  },

  // Confirm appointment
  async confirmAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.put<Appointment>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}/confirm`);
  },

  // Mark as no-show
  async markNoShow(id: string): Promise<ApiResponse<Appointment>> {
    return apiClient.put<Appointment>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}/no-show`);
  },

  // Join consultation
  async joinConsultation(appointmentId: string): Promise<ApiResponse<JoinConsultationResponse>> {
    return apiClient.post<JoinConsultationResponse>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${appointmentId}/join`);
  },

  // Get appointment statistics
  async getAppointmentStats(filters?: {
    dateFrom?: string;
    dateTo?: string;
    providerId?: string;
  }): Promise<ApiResponse<AppointmentStats>> {
    return apiClient.get<AppointmentStats>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/stats`, filters);
  },

  // Get upcoming appointments
  async getUpcomingAppointments(limit?: number): Promise<ApiResponse<Appointment[]>> {
    return apiClient.get<Appointment[]>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/upcoming`, { limit });
  },

  // Get past appointments
  async getPastAppointments(limit?: number): Promise<ApiResponse<Appointment[]>> {
    return apiClient.get<Appointment[]>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/past`, { limit });
  },

  // Search appointments
  async searchAppointments(query: string, filters?: AppointmentFilters): Promise<ApiResponse<{
    appointments: Appointment[];
    total: number;
  }>> {
    return apiClient.get(`${API_ENDPOINTS.APPOINTMENTS.BASE}/search`, { query, ...filters });
  },

  // Get appointments by patient with enhanced date filtering
  async getAppointmentsByPatient(patientId: string, filters?: Omit<AppointmentFilters, 'patientId'>): Promise<ApiResponse<{
    appointments: Appointment[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    const queryParams = { ...filters, patientId };
    
    // Convert Date objects to ISO strings for the API
    if (filters?.startDate instanceof Date) {
      queryParams.dateFrom = filters.startDate.toISOString();
      delete queryParams.startDate;
    } else if (filters?.startDate) {
      queryParams.dateFrom = String(filters.startDate);
      delete queryParams.startDate;
    }
    
    if (filters?.endDate instanceof Date) {
      queryParams.dateTo = filters.endDate.toISOString();
      delete queryParams.endDate;
    } else if (filters?.endDate) {
      queryParams.dateTo = String(filters.endDate);
      delete queryParams.endDate;
    }
    
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.BY_PATIENT, queryParams);
  },

  // Get appointments by provider with enhanced date filtering
  async getAppointmentsByProvider(providerId: string, filters?: Omit<AppointmentFilters, 'providerId'>): Promise<ApiResponse<{
    appointments: Appointment[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    const queryParams = { ...filters, providerId };
    
    // Convert Date objects to ISO strings for the API
    if (filters?.startDate instanceof Date) {
      queryParams.dateFrom = filters.startDate.toISOString();
      delete queryParams.startDate;
    } else if (filters?.startDate) {
      queryParams.dateFrom = String(filters.startDate);
      delete queryParams.startDate;
    }
    
    if (filters?.endDate instanceof Date) {
      queryParams.dateTo = filters.endDate.toISOString();
      delete queryParams.endDate;
    } else if (filters?.endDate) {
      queryParams.dateTo = String(filters.endDate);
      delete queryParams.endDate;
    }
    
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.BY_PROVIDER, queryParams);
  },

  // Get appointments for calendar view (optimized for calendar integration)
  async getAppointmentsForCalendar(
    providerId: string, 
    startDate: Date, 
    endDate: Date, 
    options?: { includePatientDetails?: boolean, status?: Appointment['status'][] }
  ): Promise<ApiResponse<Appointment[]>> {
    return apiClient.get<Appointment[]>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/calendar`, {
      providerId,
      dateFrom: startDate.toISOString(),
      dateTo: endDate.toISOString(),
      includePatientDetails: options?.includePatientDetails === undefined ? true : options.includePatientDetails,
      status: options?.status ? options.status.join(',') : undefined
    });
  },
};

export default appointmentsApi;
