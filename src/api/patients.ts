import { apiClient, ApiResponse } from './client';

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
  appointments?: any[];
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
    return apiClient.get('/patients', filters);
  },

  // Get patient by ID
  async getPatient(id: string): Promise<ApiResponse<Patient>> {
    return apiClient.get<Patient>(`/patients/${id}`);
  },

  // Create new patient
  async createPatient(data: CreatePatientData): Promise<ApiResponse<Patient>> {
    return apiClient.post<Patient>('/patients', data);
  },

  // Update patient
  async updatePatient(id: string, data: UpdatePatientData): Promise<ApiResponse<Patient>> {
    return apiClient.put<Patient>(`/patients/${id}`, data);
  },

  // Deactivate patient
  async deactivatePatient(id: string): Promise<ApiResponse<Patient>> {
    return apiClient.put<Patient>(`/patients/${id}/deactivate`);
  },

  // Reactivate patient
  async reactivatePatient(id: string): Promise<ApiResponse<Patient>> {
    return apiClient.put<Patient>(`/patients/${id}/reactivate`);
  },

  // Get patient medical history
  async getPatientMedicalHistory(patientId: string): Promise<ApiResponse<MedicalRecord[]>> {
    return apiClient.get<MedicalRecord[]>(`/patients/${patientId}/medical-history`);
  },

  // Add medical record
  async addMedicalRecord(patientId: string, record: AddMedicalRecordData): Promise<ApiResponse<MedicalRecord>> {
    return apiClient.post<MedicalRecord>(`/patients/${patientId}/medical-records`, {
      ...record,
      date: record.date.toISOString()
    });
  },

  // Get patient appointments
  async getPatientAppointments(patientId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/patients/${patientId}/appointments`);
  },

  // Search patients
  async searchPatients(query: string): Promise<ApiResponse<Patient[]>> {
    return apiClient.get<Patient[]>('/patients/search', { query });
  },

  // Get patient statistics
  async getPatientStats(): Promise<ApiResponse<PatientStats>> {
    return apiClient.get<PatientStats>('/patients/stats');
  },

  // Get recent patients
  async getRecentPatients(limit?: number): Promise<ApiResponse<Patient[]>> {
    return apiClient.get<Patient[]>('/patients/recent', { limit });
  },
};

export default patientsApi;
