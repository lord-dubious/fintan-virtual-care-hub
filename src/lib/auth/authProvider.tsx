import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/lib/services/authService';
import { UserRole } from '@/types/prisma';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string, name: string, role: 'PATIENT' | 'PROVIDER') => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login(email, password);
      if (result.success && result.user && result.token) {
        setUser(result.user);
        localStorage.setItem('authToken', result.token);
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (email: string, password: string, name: string, role: 'PATIENT' | 'PROVIDER') => {
    try {
      const userRole = role === 'PATIENT' ? UserRole.PATIENT : UserRole.PROVIDER;
      const result = await authService.register(email, password, name, userRole);
      
      if (result.success && result.user && result.token) {
        setUser(result.user);
        localStorage.setItem('authToken', result.token);
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const checkAuth = async () => {
    setLoading(true);
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const result = await authService.checkAuth(token);
        if (result.success && result.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      }
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
