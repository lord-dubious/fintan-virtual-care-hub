
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'patient' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  dateOfBirth?: Date;
}

class AuthService {
  private currentUser: User | null = null;

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      // In a real implementation, this would validate against your database
      // For now, we'll simulate authentication
      const { email, password } = credentials;
      
      // Mock user validation
      if (email && password) {
        const mockUser: User = {
          id: `user_${Date.now()}`,
          email,
          name: email.split('@')[0],
          role: email.includes('admin') ? 'admin' : 'patient',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        this.currentUser = mockUser;
        const token = this.generateToken(mockUser);
        
        // Store in localStorage for persistence
        localStorage.setItem('auth_token', token);
        localStorage.setItem('current_user', JSON.stringify(mockUser));
        
        return { user: mockUser, token };
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      throw new Error('Login failed');
    }
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    try {
      // In a real implementation, this would create a user in your database
      const { email, password, name } = data;
      
      // Check if user already exists (mock)
      const existingUser = localStorage.getItem(`user_${email}`);
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Hash password (in real app)
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        role: 'patient',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Store user data (mock)
      localStorage.setItem(`user_${email}`, JSON.stringify({
        ...newUser,
        password: hashedPassword
      }));
      
      this.currentUser = newUser;
      const token = this.generateToken(newUser);
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('current_user', JSON.stringify(newUser));
      
      return { user: newUser, token };
    } catch (error) {
      throw new Error('Registration failed');
    }
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    
    const storedUser = localStorage.getItem('current_user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      return this.currentUser;
    }
    
    return null;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token && !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  private generateToken(user: User): string {
    // In a real app, use proper JWT generation
    return btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
  }

  async refreshToken(): Promise<string | null> {
    const user = this.getCurrentUser();
    if (!user) return null;
    
    const newToken = this.generateToken(user);
    localStorage.setItem('auth_token', newToken);
    return newToken;
  }
}

export const authService = new AuthService();
