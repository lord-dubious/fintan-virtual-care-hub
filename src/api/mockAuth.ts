import { ApiResponse } from './client';
import { User, LoginCredentials, RegisterData, AuthResponse, ChangePasswordData } from './auth';

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'demo@example.com',
    name: 'Demo User',
    role: 'PATIENT',
    phone: '+1 (555) 123-4567',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock JWT token
const generateMockToken = (userId: string) => {
  return `mock_token_${userId}_${Date.now()}`;
};

// Mock Auth API
export const mockAuthApi = {
  // Login
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    await delay(1000); // Simulate network delay
    
    // For demo purposes, accept any email/password combination
    const user: User = {
      id: '1',
      email: credentials.email,
      name: 'Demo User',
      role: 'PATIENT',
      phone: '+1 (555) 123-4567',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const token = generateMockToken(user.id);
    
    return {
      success: true,
      data: {
        user,
        token,
        refreshToken: `refresh_${token}`,
      }
    };
  },

  // Register
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    await delay(1500); // Simulate network delay
    
    // Create new user
    const user: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: data.role || 'PATIENT',
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Add to mock users array
    mockUsers.push(user);
    
    const token = generateMockToken(user.id);
    
    return {
      success: true,
      data: {
        user,
        token,
        refreshToken: `refresh_${token}`,
      }
    };
  },

  // Logout
  async logout(): Promise<ApiResponse<void>> {
    await delay(500);
    return {
      success: true,
    };
  },

  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    await delay(500);
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }
    
    // For demo, return the stored user or a default user
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      return {
        success: true,
        data: JSON.parse(storedUser),
      };
    }
    
    return {
      success: false,
      error: 'User not found',
    };
  },

  // Update profile
  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    await delay(1000);
    
    const storedUser = localStorage.getItem('current_user');
    if (!storedUser) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    const user = JSON.parse(storedUser);
    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem('current_user', JSON.stringify(updatedUser));
    
    return {
      success: true,
      data: updatedUser,
    };
  },

  // Change password
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<void>> {
    await delay(1000);
    
    // For demo purposes, always succeed
    return {
      success: true,
    };
  },

  // Request password reset
  async resetPassword(data: { email: string }): Promise<ApiResponse<void>> {
    await delay(1000);
    return {
      success: true,
    };
  },

  // Confirm password reset
  async confirmResetPassword(data: { token: string; newPassword: string }): Promise<ApiResponse<void>> {
    await delay(1000);
    return {
      success: true,
    };
  },

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken?: string }>> {
    await delay(500);
    
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token found',
      };
    }
    
    const newToken = generateMockToken('1');
    
    return {
      success: true,
      data: {
        token: newToken,
        refreshToken: `refresh_${newToken}`,
      }
    };
  },

  // Verify email
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    await delay(1000);
    return {
      success: true,
    };
  },

  // Resend verification email
  async resendVerification(): Promise<ApiResponse<void>> {
    await delay(1000);
    return {
      success: true,
    };
  },

  // Verify token
  async verifyToken(): Promise<ApiResponse<{ valid: boolean; user?: User }>> {
    await delay(500);
    
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('current_user');
    
    if (token && storedUser) {
      return {
        success: true,
        data: {
          valid: true,
          user: JSON.parse(storedUser),
        }
      };
    }
    
    return {
      success: true,
      data: {
        valid: false,
      }
    };
  },
};
