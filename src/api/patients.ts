import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

// Additional types
interface PatientAppointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  providerId: string;
  providerName: string;
}

// Patient types
export interface Patient {
  id: string;
  userId: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    avatar?: string;
  };
  appointments?: PatientAppointment[];
  medicalRecords?: MedicalRecord[];
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  type: string;
  notes: string;
  diagnosis?: string;
  prescription?: string;
  providerId?: string;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    user: {
      name: string;
    };
  };
}

export interface PatientFilters {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'lastAppointment';
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePatientData {
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
}

export interface UpdatePatientData {
  name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
}

export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  averageAge: number;
  totalAppointments: number;
}

export interface AddMedicalRecordData {
  date: Date;
  type: string;
  notes: string;
  diagnosis?: string;
  prescription?: string;
}

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
  async getPatientAppointments(patientId: string): Promise<ApiResponse<PatientAppointment[]>> {
    return apiClient.get<PatientAppointment[]>(API_ENDPOINTS.PATIENTS.APPOINTMENTS(patientId));
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
  async getCurrentPatientProfile(): Promise<ApiResponse<Patient>> {
    return apiClient.get<Patient>(`${API_ENDPOINTS.PATIENTS.BASE}/profile`);
  },

  // Get merged medical records
  async getMedicalRecords(patientId: string): Promise<ApiResponse<MedicalRecord[]>> {
    return apiClient.get<MedicalRecord[]>(API_ENDPOINTS.PATIENTS.MEDICAL_RECORDS(patientId));
  },
};

export default patientsApi;
