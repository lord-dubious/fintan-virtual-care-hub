import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

// Consultation types
export interface Consultation {
  id: string;
  appointmentId: string;
  roomUrl: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  videoEnabled: boolean;
  recordingEnabled?: boolean;
  screenShareEnabled?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  appointment?: {
    id: string;
    patientId: string;
    providerId: string;
    scheduledAt: string;
    consultationType: 'VIDEO' | 'AUDIO';
    patient?: {
      id: string;
      userId: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
    };
    provider?: {
      id: string;
      userId: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
    };
  };
}

export interface CreateConsultationData {
  appointmentId: string;
  videoEnabled?: boolean;
}

export interface UpdateConsultationData {
  status?: Consultation['status'];
  videoEnabled?: boolean;
  recordingEnabled?: boolean;
  screenShareEnabled?: boolean;
  notes?: string;
}

export interface ConsultationMessage {
  id: string;
  consultationId: string;
  userId: string;
  message: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export interface JoinConsultationResponse {
  roomUrl: string;
  token: string;
  consultation: Consultation;
}

// Consultations API
export const consultationsApi = {
  // Get consultation details by its ID
  async getConsultation(id: string): Promise<ApiResponse<Consultation>> {
    return apiClient.get<Consultation>(`${API_ENDPOINTS.CONSULTATIONS.BASE}/${id}`);
  },

  // Get consultation details by the appointment ID
  async getConsultationByAppointment(appointmentId: string): Promise<ApiResponse<Consultation>> {
    return apiClient.get<Consultation>(`${API_ENDPOINTS.CONSULTATIONS.BASE}/appointment/${appointmentId}`);
  },

  // Creates the consultation room and gets the join token
  async joinConsultation(appointmentId: string): Promise<ApiResponse<JoinConsultationResponse>> {
    return apiClient.post<JoinConsultationResponse>(API_ENDPOINTS.CONSULTATIONS.JOIN_ROOM(appointmentId));
  },

  // Update consultation notes
  async updateNotes(consultationId: string, notes: string): Promise<ApiResponse<Consultation>> {
    return apiClient.put<Consultation>(API_ENDPOINTS.CONSULTATIONS.NOTES(consultationId), { notes });
  },

  // Create a new consultation
  async createConsultation(data: CreateConsultationData): Promise<ApiResponse<Consultation>> {
    return apiClient.post<Consultation>(`/consultations/create/${data.appointmentId}`, data);
  },

  // Start a consultation
  async startConsultation(consultationId: string): Promise<ApiResponse<Consultation>> {
    return apiClient.put<Consultation>(`/consultations/${consultationId}/status`, {
      status: 'IN_PROGRESS'
    });
  },

  // End a consultation
  async endConsultation(consultationId: string, notes?: string): Promise<ApiResponse<Consultation>> {
    return apiClient.put<Consultation>(`/consultations/${consultationId}`, {
      status: 'COMPLETED',
      notes
    });
  },

  // Update consultation
  async updateConsultation(consultationId: string, data: UpdateConsultationData): Promise<ApiResponse<Consultation>> {
    return apiClient.put<Consultation>(`/consultations/${consultationId}`, data);
  },

  // Request video (from provider to patient)
  async requestVideo(consultationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`/consultations/${consultationId}/request-video`);
  },

  // Enable video
  async enableVideo(consultationId: string): Promise<ApiResponse<Consultation>> {
    return apiClient.put<Consultation>(`/consultations/${consultationId}`, {
      videoEnabled: true
    });
  },

  // Start recording
  async startRecording(consultationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`/consultations/${consultationId}/start-recording`);
  },

  // Stop recording
  async stopRecording(consultationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`/consultations/${consultationId}/stop-recording`);
  },

  // Start screen sharing
  async shareScreen(consultationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`/consultations/${consultationId}/share-screen`);
  },

  // Stop screen sharing
  async stopScreenShare(consultationId: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`/consultations/${consultationId}/stop-screen-share`);
  },

  // Get consultation messages
  async getMessages(consultationId: string): Promise<ApiResponse<ConsultationMessage[]>> {
    return apiClient.get<ConsultationMessage[]>(`/consultations/${consultationId}/messages`);
  },

  // Send a message
  async sendMessage(consultationId: string, message: string): Promise<ApiResponse<ConsultationMessage>> {
    return apiClient.post<ConsultationMessage>(`/consultations/${consultationId}/messages`, {
      message
    });
  },
};

export default consultationsApi;
