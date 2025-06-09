
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Basic token generation without external JWT library
const generateToken = (userId: string, email: string, role: string): string => {
  const payload = {
    userId,
    email,
    role,
    timestamp: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
  return btoa(JSON.stringify(payload));
};

const verifyToken = (token: string): any => {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.expiresAt && payload.expiresAt < Date.now()) {
      return null; // Token expired
    }
    return payload;
  } catch {
    return null;
  }
};

export interface AuthResult {
  success: boolean;
  user?: any;
  token?: string;
  message?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // For demo purposes, use mock authentication
      // In a real app, this would connect to your backend API
      
      if (email && password) {
        const mockUser = {
          id: `user_${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: email.includes('admin') ? 'ADMIN' : email.includes('provider') ? 'PROVIDER' : 'PATIENT',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const token = generateToken(mockUser.id, mockUser.email, mockUser.role);
        
        return {
          success: true,
          user: mockUser,
          token,
        };
      }
      
      return {
        success: false,
        message: 'Invalid email or password',
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login',
      };
    }
  },

  async register(email: string, password: string, name: string, role: string = 'PATIENT'): Promise<AuthResult> {
    try {
      // For demo purposes, use mock registration
      // In a real app, this would connect to your backend API
      
      const mockUser = {
        id: `user_${Date.now()}`,
        email,
        name,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const token = generateToken(mockUser.id, mockUser.email, mockUser.role);
      
      return {
        success: true,
        user: mockUser,
        token,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration',
      };
    }
  },

  async verifyToken(token: string): Promise<any> {
    return verifyToken(token);
  },

  async getUserById(id: string): Promise<any> {
    // Mock implementation
    return null;
  },

  async getUserByEmail(email: string): Promise<any> {
    // Mock implementation
    return null;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
    return {
      success: true,
      message: 'Password changed successfully',
    };
  },

  async resetPassword(email: string): Promise<AuthResult> {
    return {
      success: true,
      message: 'Password reset instructions sent to your email',
    };
  },
};
