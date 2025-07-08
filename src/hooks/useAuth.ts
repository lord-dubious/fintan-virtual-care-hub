import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, User, LoginCredentials, RegisterData, AuthResponse } from '@/api/auth';
import { useToast } from '@/hooks/use-toast';
import { tokenManager } from '@/api/cookieTokenManager';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initialize CSRF token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Try to migrate from localStorage if needed
      await tokenManager.migrateFromLocalStorage();

      // Initialize CSRF token for cookie-based auth
      await tokenManager.initializeCSRFToken();
    };

    initializeAuth();
  }, []);

  // Get current user (works with both cookie and token auth)
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      // For cookie-based auth, we don't check token expiry locally
      // The server will handle token validation
      const cachedUser = tokenManager.getUserData();
      if (cachedUser) {
        return cachedUser;
      }

      // Try to get profile from server
      const response = await authApi.getProfile();
      if (response.success && response.data) {
        tokenManager.setUserData(response.data);
        return response.data;
      }
      return null;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await authApi.login(credentials);
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      // Store auth data using cookie-based token manager
      tokenManager.setAuthData({
        user: data.user,
        csrfToken: data.csrfToken || '', // CSRF token from cookie-based auth
      });

      // Update query cache
      queryClient.setQueryData(['auth', 'user'], data.user);

      toast({
        title: "Welcome back!",
        description: "You've been signed in successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await authApi.register(data);
      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      // Store auth data using cookie-based token manager
      tokenManager.setAuthData({
        user: data.user,
        csrfToken: data.csrfToken || '', // CSRF token from cookie-based auth
      });

      // Update query cache
      queryClient.setQueryData(['auth', 'user'], data.user);

      toast({
        title: "Account Created!",
        description: "Welcome to Dr. Fintan's practice.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSuccess: () => {
      // Clear auth data using token manager
      tokenManager.clearAuthData();

      // Clear query cache
      queryClient.clear();

      toast({
        title: "Logged Out",
        description: "You've been signed out successfully.",
      });
    },
    onError: () => {
      // Clear auth data even if API call fails
      tokenManager.clearAuthData();
      queryClient.clear();
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const response = await authApi.updateProfile(data);
      if (!response.success) {
        throw new Error(response.error || 'Update failed');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data);
      tokenManager.setUserData(data);

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await authApi.changePassword(data);
      if (!response.success) {
        throw new Error(response.error || 'Password change failed');
      }
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password Change Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // State
    user,
    isLoading,
    error,
    isAuthenticated: !!user,

    // Actions
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,
    updateProfile: updateProfileMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,

    // Loading states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,

    // Role-based access
    hasRole: (role: string) => user?.role === role,
    hasAnyRole: (roles: string[]) => user?.role ? roles.includes(user.role) : false,
    isPatient: user?.role === 'PATIENT',
    isProvider: user?.role === 'PROVIDER',
    isAdmin: user?.role === 'ADMIN',
  };
};

// Role-based access control hooks
export const useHasRole = (requiredRole: string) => {
  const { user } = useAuth();
  return user?.role === requiredRole;
};

export const useHasAnyRole = (requiredRoles: string[]) => {
  const { user } = useAuth();
  return user?.role ? requiredRoles.includes(user.role) : false;
};

export const useIsPatient = () => useHasRole('PATIENT');
export const useIsProvider = () => useHasRole('PROVIDER');
export const useIsAdmin = () => useHasRole('ADMIN');

export const useRequestPasswordReset = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
    onSuccess: (response) => {
      toast({
        title: "Password Reset Email Sent",
        description: response.data?.message || "If an account with that email exists, a password reset link has been sent.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useConfirmPasswordReset = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: ({ password, token }: { password: string; token: string }) => authApi.confirmPasswordReset(password, token),
    onSuccess: (response) => {
      toast({
        title: "Password Reset Successful",
        description: response.data?.message || "Your password has been changed successfully. Please log in.",
      });
      navigate('/login');
    },
    onError: (error: Error) => {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
