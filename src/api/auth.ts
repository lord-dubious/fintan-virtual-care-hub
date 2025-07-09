import { apiClient, ApiResponse } from './client';
import { mockAuthApi } from './mockAuth';

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'PATIENT' | 'PROVIDER' | 'ADMIN';
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'PATIENT' | 'PROVIDER';
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  additionalInfo?: any;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface ConfirmResetPasswordData {
  token: string;
  newPassword: string;
}

// Check if we should use mock API (for development/demo)
const USE_MOCK_API = import.meta.env.DEV || !import.meta.env.VITE_API_URL;

// Auth API
export const authApi = {
  // Login
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    if (USE_MOCK_API) {
      return mockAuthApi.login(credentials);
    }
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  // Register
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    if (USE_MOCK_API) {
      return mockAuthApi.register(data);
    }
    return apiClient.post<AuthResponse>('/auth/register', data);
  },

  // Logout
  async logout(): Promise<ApiResponse<void>> {
    if (USE_MOCK_API) {
      return mockAuthApi.logout();
    }
    return apiClient.post<void>('/auth/logout');
  },

  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    if (USE_MOCK_API) {
      return mockAuthApi.getProfile();
    }
    return apiClient.get<User>('/auth/profile');
  },

  // Update profile
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    if (USE_MOCK_API) {
      return mockAuthApi.updateProfile(data);
    }
    return apiClient.put<User>('/auth/profile', data);
  },

  // Change password
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    if (USE_MOCK_API) {
      return mockAuthApi.changePassword(data);
    }
    return apiClient.put<void>('/auth/change-password', data);
  },

  // Request password reset
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse<void>> {
    if (USE_MOCK_API) {
      return mockAuthApi.resetPassword(data);
    }
    return apiClient.post<void>('/auth/reset-password', data);
  },

  // Confirm password reset
  async confirmResetPassword(data: ConfirmResetPasswordData): Promise<ApiResponse<void>> {
    if (USE_MOCK_API) {
      return mockAuthApi.confirmResetPassword(data);
    }
    return apiClient.post<void>('/auth/confirm-reset-password', data);
  },

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken?: string }>> {
    if (USE_MOCK_API) {
      return mockAuthApi.refreshToken();
    }
    const refreshToken = localStorage.getItem('refresh_token');
    return apiClient.post<{ token: string; refreshToken?: string }>('/auth/refresh', {
      refreshToken
    });
  },

  // Verify email
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    if (USE_MOCK_API) {
      return mockAuthApi.verifyEmail(token);
    }
    return apiClient.post<void>('/auth/verify-email', { token });
  },

  // Resend verification email
  async resendVerification(): Promise<ApiResponse<void>> {
    if (USE_MOCK_API) {
      return mockAuthApi.resendVerification();
    }
    return apiClient.post<void>('/auth/resend-verification');
  },

  // Verify token
  async verifyToken(): Promise<ApiResponse<{ valid: boolean; user?: User }>> {
    if (USE_MOCK_API) {
      return mockAuthApi.verifyToken();
    }
    return apiClient.get<{ valid: boolean; user?: User }>('/auth/verify-token');
  },
};

export default authApi;
