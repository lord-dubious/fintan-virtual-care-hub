import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import {
  Patient,
  MedicalRecord,
  PatientFilters,
  CreateInput,
  UpdateInput,
  PatientWithUser, // Added PatientWithUser
  PatientAppointment as DomainPatientAppointment // Added DomainPatientAppointment
} from '../../shared/domain';

// Type aliases for better readability
export type CreatePatientData = CreateInput<Patient>;
export type UpdatePatientData = UpdateInput<Patient>;

// Additional local types for API responses that extend shared domain types
interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  averageAge: number;
  totalAppointments: number;
}

interface AddMedicalRecordData {
  date: Date;
  type: string;
  notes: string;
  diagnosis?: string;
  prescription?: string;
}

export interface PatientDashboardData {
  patient: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    emergencyContact?: unknown;
    allergies?: string[];
    medications?: string[];
    medicalHistory?: string;
  };
  upcomingAppointments: Array<{
    id: string;
    date: string;
    duration: number;
    consultationType: string;
    reason?: string;
    status: string;
    provider: {
      name: string;
      specialization?: string;
      profilePicture?: string;
      consultationFee?: number;
    };
  }>;
  recentAppointments: Array<{
    id: string;
    date: string;
    duration: number;
    consultationType: string;
    reason?: string;
    status: string;
    provider: {
      name: string;
      specialization?: string;
    };
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    description: string;
    metadata?: unknown;
    createdAt: string;
  }>;
  medicalRecords: Array<{
    id: string;
    diagnosis?: string;
    treatment?: string;
    prescription?: string;
    notes?: string;
    createdAt: string;
    provider?: {
      name: string;
    };
  }>;
  statistics: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    totalMedicalRecords: number;
  };
  nextAppointment?: {
    id: string;
    date: string;
    provider: string;
    consultationType: string;
  };
}

// Removed local PatientAppointment interface, using type from shared/domain.ts

// Patients API
export const patientsApi = {
  // Get patients with optional filters
  async getPatients(filters?: PatientFilters): Promise<ApiResponse<{
    patients: Patient[];
    total: number;
    page: number;
    totalPages: number;
  }>> {
    return apiClient.get(API_ENDPOINTS.PATIENTS.BASE, filters);
  },

  // Get patient by ID
  async getPatient(id: string): Promise<ApiResponse<Patient>> {
    return apiClient.get<Patient>(API_ENDPOINTS.PATIENTS.PROFILE(id));
  },

  // Create new patient
  async createPatient(data: CreatePatientData): Promise<ApiResponse<Patient>> {
    return apiClient.post<Patient>(API_ENDPOINTS.PATIENTS.BASE, data);
  },

  // Update patient
  async updatePatient(id: string, data: UpdatePatientData): Promise<ApiResponse<Patient>> {
    return apiClient.put<Patient>(API_ENDPOINTS.PATIENTS.PROFILE(id), data);
  },

  // Deactivate patient
  async deactivatePatient(id: string): Promise<ApiResponse<Patient>> {
    return apiClient.put<Patient>(`${API_ENDPOINTS.PATIENTS.BASE}/${id}/deactivate`);
  },

  // Reactivate patient
  async reactivatePatient(id: string): Promise<ApiResponse<Patient>> {
    return apiClient.put<Patient>(`${API_ENDPOINTS.PATIENTS.BASE}/${id}/reactivate`);
  },

  // Get patient medical history
  async getPatientMedicalHistory(patientId: string): Promise<ApiResponse<MedicalRecord[]>> {
    return apiClient.get<MedicalRecord[]>(`${API_ENDPOINTS.PATIENTS.BASE}/${patientId}/medical-history`);
  },

  // Add medical record
  async addMedicalRecord(patientId: string, record: AddMedicalRecordData): Promise<ApiResponse<MedicalRecord>> {
    return apiClient.post<MedicalRecord>(API_ENDPOINTS.PATIENTS.MEDICAL_RECORDS(patientId), {
      ...record,
      date: record.date.toISOString()
    });
  },

  // Get patient appointments
  async getPatientAppointments(patientId: string): Promise<ApiResponse<DomainPatientAppointment[]>> { // Changed to DomainPatientAppointment[]
    return apiClient.get<DomainPatientAppointment[]>(API_ENDPOINTS.PATIENTS.APPOINTMENTS(patientId));
  },

  // Search patients
  async searchPatients(query: string): Promise<ApiResponse<Patient[]>> {
    return apiClient.get<Patient[]>(`${API_ENDPOINTS.PATIENTS.BASE}/search`, { query });
  },

  // Get patient statistics
  async getPatientStats(): Promise<ApiResponse<PatientStats>> {
    return apiClient.get<PatientStats>(`${API_ENDPOINTS.PATIENTS.BASE}/stats`);
  },

  // Get recent patients
  async getRecentPatients(limit?: number): Promise<ApiResponse<Patient[]>> {
    return apiClient.get<Patient[]>(`${API_ENDPOINTS.PATIENTS.BASE}/recent`, { limit });
  },

  // Get current patient profile (for dashboard)
  async getCurrentPatientProfile(): Promise<ApiResponse<PatientWithUser>> { // Changed return type to PatientWithUser
    return apiClient.get<PatientWithUser>(`${API_ENDPOINTS.PATIENTS.BASE}/profile`);
  },

  // Get patient dashboard data
  async getPatientDashboard(): Promise<ApiResponse<PatientDashboardData>> {
    return apiClient.get(`${API_ENDPOINTS.PATIENTS.BASE}/dashboard`);
  },

  // Get merged medical records
  async getMedicalRecords(patientId: string): Promise<ApiResponse<MedicalRecord[]>> {
    return apiClient.get<MedicalRecord[]>(API_ENDPOINTS.PATIENTS.MEDICAL_RECORDS(patientId));
  },
};

// Export types for use in other modules
export type { Patient, PatientFilters, MedicalRecord, PatientAppointment as DomainPatientAppointment } from '../../shared/domain';

export default patientsApi;
