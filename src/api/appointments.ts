import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  ApiResponse,
  AppointmentStatus,
  ConsultationType,
  PaymentStatus,
  Appointment as DomainAppointment, // Alias to avoid naming conflict
  AppointmentWithDetails as DomainAppointmentWithDetails,
  PatientWithUser,
  ProviderWithUser,
  Consultation as DomainConsultation
} from '../../shared/domain';

// Use the canonical Appointment from shared/domain.ts
export type Appointment = DomainAppointment;

// Extended API appointment interface with additional fields for API layer
// This corresponds to the `AppointmentWithDetails` in shared/domain.ts
export interface ApiAppointment extends DomainAppointment {
  patient?: PatientWithUser;
  provider?: ProviderWithUser;
  consultation?: DomainConsultation;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  consultationType?: ConsultationType;
  patientId?: string;
  providerId?: string;
  dateFrom?: Date | string; // Changed to Date | string
  dateTo?: Date | string;   // Changed to Date | string
  startDate?: Date | string;
  endDate?: Date | string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export interface CreateAppointmentData {
  patientId?: string;
  providerId: string;
  appointmentDate: Date; // Changed from scheduledAt: string to appointmentDate: Date
  duration?: number;
  consultationType: ConsultationType;
  reason?: string;
  notes?: string;
}

export interface UpdateAppointmentData {
  scheduledAt?: string;
  duration?: number;
  consultationType?: ConsultationType;
  status?: AppointmentStatus;
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
    appointments: ApiAppointment[]; // Changed to ApiAppointment
    total: number;
    page: number;
    totalPages: number;
  }>> {
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.BASE, filters);
  },

  // Get appointment by ID
  async getAppointment(id: string): Promise<ApiResponse<ApiAppointment>> { // Changed to ApiAppointment
    return apiClient.get<ApiAppointment>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}`);
  },

  // Create new appointment
  async createAppointment(data: CreateAppointmentData): Promise<ApiResponse<ApiAppointment>> {
    return apiClient.post<ApiAppointment>(API_ENDPOINTS.APPOINTMENTS.BASE, {
      ...data,
      appointmentDate: data.appointmentDate.toISOString() // Convert Date to ISO string for API
    });
  },

  // Update appointment
  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<ApiResponse<ApiAppointment>> { // Changed to ApiAppointment
    return apiClient.put<ApiAppointment>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}`, data);
  },

  // Update appointment status
  async updateAppointmentStatus(id: string, status: Appointment['status'], notes?: string): Promise<ApiResponse<ApiAppointment>> { // Changed to ApiAppointment
    return apiClient.put<ApiAppointment>(API_ENDPOINTS.APPOINTMENTS.STATUS(id), { status, notes });
  },

  // Cancel appointment
  async cancelAppointment(id: string, reason?: string): Promise<ApiResponse<ApiAppointment>> { // Changed to ApiAppointment
    return apiClient.put<ApiAppointment>(API_ENDPOINTS.APPOINTMENTS.CANCEL(id), { reason });
  },

  // Reschedule appointment
  async rescheduleAppointment(id: string, newDate: Date): Promise<ApiResponse<ApiAppointment>> { // Changed to ApiAppointment
    return apiClient.put<ApiAppointment>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}/reschedule`, {
      scheduledAt: newDate.toISOString()
    });
  },

  // Confirm appointment
  async confirmAppointment(id: string): Promise<ApiResponse<ApiAppointment>> { // Changed to ApiAppointment
    return apiClient.put<ApiAppointment>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}/confirm`);
  },

  // Mark as no-show
  async markNoShow(id: string): Promise<ApiResponse<ApiAppointment>> { // Changed to ApiAppointment
    return apiClient.put<ApiAppointment>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${id}/no-show`);
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
  async getUpcomingAppointments(limit?: number): Promise<ApiResponse<ApiAppointment[]>> { // Changed to ApiAppointment
    return apiClient.get<ApiAppointment[]>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/upcoming`, { limit });
  },

  // Get past appointments
  async getPastAppointments(limit?: number): Promise<ApiResponse<ApiAppointment[]>> { // Changed to ApiAppointment
    return apiClient.get<ApiAppointment[]>(`${API_ENDPOINTS.APPOINTMENTS.BASE}/past`, { limit });
  },

  // Search appointments
  async searchAppointments(query: string, filters?: AppointmentFilters): Promise<ApiResponse<{
    appointments: ApiAppointment[]; // Changed to ApiAppointment
    total: number;
  }>> {
    return apiClient.get(`${API_ENDPOINTS.APPOINTMENTS.BASE}/search`, { query, ...filters });
  },

  // Get appointments by patient with enhanced date filtering
  async getAppointmentsByPatient(patientId: string, filters?: Omit<AppointmentFilters, 'patientId'>): Promise<ApiResponse<{
    appointments: ApiAppointment[]; // Changed to ApiAppointment
    total: number;
    page: number;
    totalPages: number;
  }>> {
    const queryParams: Record<string, unknown> = {
      ...filters,
      patientId
    };
    
    // Convert date filters to API format
    if (filters?.startDate instanceof Date) {
      queryParams.dateFrom = filters.startDate.toISOString();
    } else if (filters?.startDate) {
      queryParams.dateFrom = String(filters.startDate);
    }
    
    if (filters?.endDate instanceof Date) {
      queryParams.dateTo = filters.endDate.toISOString();
    } else if (filters?.endDate) {
      queryParams.dateTo = String(filters.endDate);
    }
    
    // Remove the original date fields since we've converted them
    delete queryParams.startDate;
    delete queryParams.endDate;
    
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.BY_PATIENT, queryParams);
  },

  // Get appointments by provider with enhanced date filtering
  async getAppointmentsByProvider(providerId: string, filters?: Omit<AppointmentFilters, 'providerId'>): Promise<ApiResponse<{
    appointments: ApiAppointment[]; // Changed to ApiAppointment
    total: number;
    page: number;
    totalPages: number;
  }>> {
    const queryParams: Record<string, unknown> = {
      ...filters,
      providerId
    };
    
    // Convert date filters to API format
    if (filters?.startDate instanceof Date) {
      queryParams.dateFrom = filters.startDate.toISOString();
    } else if (filters?.startDate) {
      queryParams.dateFrom = String(filters.startDate);
    }
    
    if (filters?.endDate instanceof Date) {
      queryParams.dateTo = filters.endDate.toISOString();
    } else if (filters?.endDate) {
      queryParams.dateTo = String(filters.endDate);
    }
    
    // Remove the original date fields since we've converted them
    delete queryParams.startDate;
    delete queryParams.endDate;
    
    return apiClient.get(API_ENDPOINTS.APPOINTMENTS.BY_PROVIDER, queryParams);
  },

  // Get appointments for calendar view (optimized for calendar integration)
  async getAppointmentsForCalendar(
    providerId: string, 
    startDate: Date,
    endDate: Date,
    options?: { includePatientDetails?: boolean, status?: Appointment['status'][] }
  ): Promise<ApiResponse<ApiAppointment[]>> { // Changed to ApiAppointment
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
