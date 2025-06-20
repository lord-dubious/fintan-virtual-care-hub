import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, User, LoginCredentials, RegisterData, AuthResponse } from '@/api/auth';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;
      
      const response = await authApi.getProfile();
      if (response.success) {
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
      // Store tokens
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
      localStorage.setItem('current_user', JSON.stringify(data.user));
      
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
      // Store tokens
      localStorage.setItem('auth_token', data.token);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
      localStorage.setItem('current_user', JSON.stringify(data.user));
      
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
      // Clear storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
      
      // Clear query cache
      queryClient.clear();
      
      toast({
        title: "Logged Out",
        description: "You've been signed out successfully.",
      });
    },
    onError: () => {
      // Clear storage even if API call fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('current_user');
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
      localStorage.setItem('current_user', JSON.stringify(data));
      
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
  };
};
