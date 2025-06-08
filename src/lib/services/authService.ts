import { PrismaClient, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'fintan-virtual-care-hub-secret-key-2025';
const TOKEN_EXPIRY = '7d'; // Token expires in 7 days

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Check if password is correct
      if (!user.password) {
        return {
          success: false,
          message: 'Account requires social login',
        };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid email or password',
        };
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      return {
        success: true,
        user,
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login',
      };
    }
  },

  async register(email: string, password: string, name: string, role: UserRole = UserRole.PATIENT): Promise<AuthResult> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return {
          success: false,
          message: 'Email already in use',
        };
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
        },
      });

      // Create patient or provider profile based on role
      if (role === UserRole.PATIENT) {
        await prisma.patient.create({
          data: {
            userId: user.id,
          },
        });
      } else if (role === UserRole.PROVIDER) {
        await prisma.provider.create({
          data: {
            userId: user.id,
          },
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id,
          email: user.email,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
      );

      return {
        success: true,
        user,
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

  async verifyToken(token: string): Promise<User | null> {
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Get the user from the database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      return user;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  },

  async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.password) {
        return {
          success: false,
          message: 'User not found or password cannot be changed',
        };
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Current password is incorrect',
        };
      }

      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
        },
      });

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'An error occurred while changing password',
      };
    }
  },

  async resetPassword(email: string): Promise<AuthResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      // In a real application, you would:
      // 1. Generate a reset token
      // 2. Store it in the database with an expiration
      // 3. Send an email with a reset link
      // 4. Implement a separate endpoint to handle the reset

      // For this demo, we'll just return success
      return {
        success: true,
        message: 'Password reset instructions sent to your email',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'An error occurred while processing your request',
      };
    }
  },
};

