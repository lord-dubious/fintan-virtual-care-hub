import { apiClient, ApiResponse } from './client';
import { User } from './auth';

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
}

export interface ProfilePictureUploadResponse {
  user: User;
  profilePictureUrl: string;
}

// Profile API
export const profileApi = {
  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/api/profile');
  },

  // Update user profile
  async updateProfile(data: ProfileUpdateData): Promise<ApiResponse<User>> {
    return apiClient.put<User>('/api/profile', data);
  },

  // Upload profile picture
  async uploadProfilePicture(file: File): Promise<ApiResponse<ProfilePictureUploadResponse>> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return apiClient.postFormData<ProfilePictureUploadResponse>('/api/profile/picture', formData);
  },

  // Delete profile picture
  async deleteProfilePicture(): Promise<ApiResponse<User>> {
    return apiClient.delete<User>('/api/profile/picture');
  },
};
