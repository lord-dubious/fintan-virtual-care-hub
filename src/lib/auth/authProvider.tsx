import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '@/hooks/use-toast';

// Define the User type
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'PATIENT' | 'PROVIDER' | 'ADMIN';
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: 'PATIENT' | 'PROVIDER') => Promise<boolean>;
  logout: () => void;
  isAuthenticated: () => boolean;
  hasRole: (role: 'PATIENT' | 'PROVIDER' | 'ADMIN') => boolean;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if the user is already logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Verify the token and get the user data
          const userData = await authService.verifyToken(token);
          if (userData) {
            setUser(userData);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('auth_token');
          }
        }
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Authentication failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.login(email, password);
      if (result.success && result.user && result.token) {
        // Store the token in localStorage
        localStorage.setItem('auth_token', result.token);
        // Set the user data
        setUser({
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        });
        toast({
          title: 'Login Successful',
          description: `Welcome back, ${result.user.name || result.user.email}!`,
        });
        return true;
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
        toast({
          title: 'Login Failed',
          description: result.message || 'Please check your credentials and try again.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'PATIENT' | 'PROVIDER'
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.register(email, password, name, role);
      if (result.success && result.user && result.token) {
        // Store the token in localStorage
        localStorage.setItem('auth_token', result.token);
        // Set the user data
        setUser({
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        });
        toast({
          title: 'Registration Successful',
          description: `Welcome to Virtual Care Hub, ${result.user.name || result.user.email}!`,
        });
        return true;
      } else {
        setError(result.message || 'Registration failed. Please try again.');
        toast({
          title: 'Registration Failed',
          description: result.message || 'Please check your information and try again.',
          variant: 'destructive',
        });
        return false;
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
      toast({
        title: 'Registration Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    navigate('/auth/login');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  // Check if the user is authenticated
  const isAuthenticated = (): boolean => {
    return !!user;
  };

  // Check if the user has a specific role
  const hasRole = (role: 'PATIENT' | 'PROVIDER' | 'ADMIN'): boolean => {
    return user?.role === role;
  };

  // Create the context value
  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// Create a hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

