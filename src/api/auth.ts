import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS, REFRESH_TOKEN_STORAGE_KEY } from './config';
import { LoginSchema, RegisterSchema } from '@/lib/validation/schemas';
import type { LoginData, RegisterData, User } from '@/lib/validation/schemas';

// Use types from validation schemas for consistency and validation
export type { User, LoginData, RegisterData } from '@/lib/validation/schemas';
export type LoginCredentials = LoginData;

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  csrfToken?: string;
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

// Auth API
export const authApi = {
  // Login
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    // Validate input data
    const validatedCredentials = LoginSchema.parse(credentials);
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, validatedCredentials);
  },

  // Register
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    // Validate input data
    const validatedData = RegisterSchema.parse(data);
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, validatedData);
  },

  // Logout
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
  },

  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(API_ENDPOINTS.AUTH.PROFILE);
  },

  // Update profile
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put<User>(API_ENDPOINTS.AUTH.PROFILE, data);
  },

  // Change password
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    return apiClient.put<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  // Request password reset
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  },

  // Confirm password reset
  async confirmResetPassword(data: ConfirmResetPasswordData): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.CONFIRM_RESET_PASSWORD, data);
  },

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken?: string }>> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    return apiClient.post<{ token: string; refreshToken?: string }>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken
    });
  },

  // Verify email
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  },

  // Resend verification email
  async resendVerification(): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION);
  },

  // Verify token
  async verifyToken(token: string): Promise<ApiResponse<{ valid: boolean; user?: User }>> {
    return apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_TOKEN}?token=${token}`);
  },

  // Request a password reset email
  async requestPasswordReset(email: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { email });
  },

  // Confirm the password reset with a token
  async confirmPasswordReset(password: string, token: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.CONFIRM_RESET_PASSWORD, { password, token });
  },
};

export default authApi;
