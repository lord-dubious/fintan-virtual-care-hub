
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, AuthResult } from '@/services/authService';
import { User, UserRole } from '@/types/prisma';

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string, name: string, role?: UserRole) => Promise<AuthResult>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const result = await authService.checkAuth(token);
        if (result.success && result.user) {
          setUser(result.user);
        } else {
          localStorage.removeItem('auth_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setError(null);
    try {
      const result = await authService.login(email, password);
      if (result.success && result.user && result.token) {
        setUser(result.user);
        localStorage.setItem('auth_token', result.token);
      } else {
        setError(result.message || 'Login failed');
      }
      return result;
    } catch (error) {
      const errorMessage = 'Login failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole = UserRole.PATIENT): Promise<AuthResult> => {
    setError(null);
    try {
      const result = await authService.register(email, password, name, role);
      if (result.success && result.user && result.token) {
        setUser(result.user);
        localStorage.setItem('auth_token', result.token);
      } else {
        setError(result.message || 'Registration failed');
      }
      return result;
    } catch (error) {
      const errorMessage = 'Registration failed';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('auth_token');
  };

  const isAuthenticated = (): boolean => {
    return user !== null;
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const value: AuthContextProps = {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
