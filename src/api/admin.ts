import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { Patient } from './patients';
import { Appointment } from './appointments';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'PATIENT' | 'PROVIDER' | 'ADMIN';
  createdAt: string;
  isActive: boolean;
}

export interface SystemStats {
  totalUsers: number;
  totalPatients: number;
  totalProviders: number;
  totalAppointments: number;
  totalRevenue: number;
}

export interface AdminSettings {
  [key: string]: any;
}

export const adminApi = {
  // Fetch all users
  async getUsers(filters?: { role?: string; search?: string }): Promise<ApiResponse<{ users: User[], total: number }>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.USERS, filters);
  },

  // Fetch a single user
  async getUser(userId: string): Promise<ApiResponse<User>> {
    return apiClient.get(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`);
  },

  // Update a user's role or status
  async updateUser(userId: string, data: { role?: string; isActive?: boolean }): Promise<ApiResponse<User>> {
    return apiClient.put(`${API_ENDPOINTS.ADMIN.USERS}/${userId}`, data);
  },

  // Fetch all appointments
  async getAppointments(filters?: any): Promise<ApiResponse<{ appointments: Appointment[], total: number }>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.APPOINTMENTS, filters);
  },

  // Fetch system-wide statistics
  async getStatistics(): Promise<ApiResponse<SystemStats>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.STATISTICS);
  },

  // Fetch application settings
  async getSettings(): Promise<ApiResponse<AdminSettings>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.SETTINGS);
  },

  // Update application settings
  async updateSettings(settings: AdminSettings): Promise<ApiResponse<AdminSettings>> {
    return apiClient.post(API_ENDPOINTS.ADMIN.SETTINGS, settings);
  },
};

export default adminApi; 