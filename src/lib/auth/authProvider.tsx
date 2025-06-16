import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, User as ApiUser } from '@/api/auth';

// Define user type (matching API)
type UserRole = 'ADMIN' | 'PROVIDER' | 'PATIENT';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  error: string | null;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Verify token with backend
        const response = await authApi.verifyToken();
        if (response.success && response.data?.valid && response.data.user) {
          setUser(response.data.user as User);
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('current_user');
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('current_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login({ email, password });

      if (response.success && response.data) {
        const { user: userData, token, refreshToken } = response.data;

        // Store tokens and user data
        localStorage.setItem('auth_token', token);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        localStorage.setItem('current_user', JSON.stringify(userData));

        setUser(userData as User);
        return true;
      } else {
        setError(response.error || 'Login failed');
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear storage regardless of API call result
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
      setUser(null);
      setError(null);
    }
  };

  // Signup function
  const signup = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.register({
        name,
        email,
        password,
        role: role as 'PATIENT' | 'PROVIDER'
      });

      if (response.success && response.data) {
        const { user: userData, token, refreshToken } = response.data;

        // Store tokens and user data
        localStorage.setItem('auth_token', token);
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        localStorage.setItem('current_user', JSON.stringify(userData));

        setUser(userData as User);
        return true;
      } else {
        setError(response.error || 'Registration failed');
        return false;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      console.error('Signup failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

