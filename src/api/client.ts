import axios, { AxiosInstance, AxiosResponse, AxiosError, AxiosRequestConfig } from 'axios';
import { API_CONFIG, TOKEN_STORAGE_KEY, USER_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY, API_ENDPOINTS } from './config';
import { tokenManager } from './cookieTokenManager';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private client: AxiosInstance;
  private refreshPromise: Promise<string | null> | null = null; // Single-flight refresh

  constructor() {
    this.client = axios.create({
      ...API_CONFIG,
      withCredentials: true, // Include cookies in requests
    });

    // Request interceptor to add CSRF token for cookie-based auth
    this.client.interceptors.request.use(
      (config) => {
        // Add CSRF token for cookie-based authentication
        const authHeaders = tokenManager.getAuthHeaders();
        Object.assign(config.headers, authHeaders);

        // Fallback: try to add Bearer token if available (for backward compatibility)
        const token = tokenManager.getAuthToken?.();
        if (token && !tokenManager.isTokenExpired?.(token)) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Use single-flight refresh to prevent concurrent refresh requests
            if (!this.refreshPromise) {
              this.refreshPromise = this.refreshToken();
            }

            const newToken = await this.refreshPromise;
            this.refreshPromise = null; // Clear the promise after completion

            if (newToken) {
              // Retry the original request with new token
              originalRequest.headers = { ...(originalRequest.headers ?? {}), Authorization: `Bearer ${newToken}` };
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.refreshPromise = null; // Clear the promise on error
            // Refresh failed, clear auth data and redirect
            tokenManager.clearAuthData();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        if (error.response?.status === 401) {
          // Token refresh failed or no refresh token
          tokenManager.clearAuthData();
          window.location.href = '/auth/login';
        }

        return Promise.reject(error);
      }
    );
  }

  // Single-flight token refresh method (now works with cookies)
  private async refreshToken(): Promise<string | null> {
    try {
      // For cookie-based auth, the refresh token is in HTTP-only cookie
      // The backend will automatically use it
      const response = await axios.post(
        `${API_CONFIG.baseURL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
        {}, // Empty body for cookie-based refresh
        {
          withCredentials: true, // Include cookies
          headers: tokenManager.getAuthHeaders() // Include CSRF token
        }
      );

      if (response.data.success) {
        // With cookie-based auth, tokens are automatically set in cookies
        // We just need to update the CSRF token if provided
        if (response.data.data.csrfToken) {
          tokenManager.setAuthData({
            user: response.data.data.user,
            csrfToken: response.data.data.csrfToken
          });
        }
        return 'cookie-token'; // Return placeholder since token is in HTTP-only cookie
      }

      throw new Error('Token refresh failed');
    } catch (error) {
      // Fallback to localStorage-based refresh for backward compatibility
      const refreshToken = tokenManager.getRefreshToken?.();
      if (refreshToken) {
        const response = await axios.post(`${API_CONFIG.baseURL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
          refreshToken
        });

        const { token, refreshToken: newRefreshToken } = response.data.data;

        // Update stored tokens (legacy method)
        tokenManager.setAuthToken?.(token);
        if (newRefreshToken) {
          tokenManager.setRefreshToken?.(newRefreshToken);
        }

        return token;
      }

      throw error;
    }
  }

  // Generic GET request
  async get<T>(url: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get(url, { params });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Generic POST request
  async post<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // POST request with FormData (for file uploads)
  async postFormData<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Generic PUT request
  async put<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put(url, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Generic DELETE request
  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete(url);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Generic PATCH request
  async patch<T>(url: string, data?: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch(url, data);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Error handler
  private handleError(error: unknown): ApiResponse<never> {
    if (axios.isAxiosError(error) && error.response) {
      // Server responded with error status
      return {
        success: false,
        error: error.response.data?.message || error.response.data?.error || 'Server error',
      };
    } else if (axios.isAxiosError(error) && error.request) {
      // Request was made but no response received
      return {
        success: false,
        error: 'Network error - please check your connection',
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: (error instanceof Error ? error.message : 'An unexpected error occurred'),
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
