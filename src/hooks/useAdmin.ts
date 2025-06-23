import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, AdminSettings, User } from '@/api/admin';
import { useToast } from '@/hooks/use-toast';

// Hook to fetch all users
export const useAdminUsers = (filters?: { role?: string; search?: string }) => {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => {
      const response = await adminApi.getUsers(filters);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch users');
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch all appointments for the admin panel
export const useAdminAppointments = (filters?: any) => {
  return useQuery({
    queryKey: ['admin', 'appointments', filters],
    queryFn: async () => {
      const response = await adminApi.getAppointments(filters);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch appointments');
      }
      return response.data!;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

// Hook to fetch system statistics
export const useAdminStatistics = () => {
  return useQuery({
    queryKey: ['admin', 'statistics'],
    queryFn: async () => {
      const response = await adminApi.getStatistics();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch statistics');
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch system settings
export const useAdminSettings = () => {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const response = await adminApi.getSettings();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch settings');
      }
      return response.data!;
    },
  });
};

// Hook to update system settings
export const useUpdateAdminSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (settings: AdminSettings) => {
      const response = await adminApi.updateSettings(settings);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update settings');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      toast({
        title: 'Settings Updated',
        description: 'System settings have been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

// Hook to update a user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string, data: { role?: string; isActive?: boolean } }) => {
      const response = await adminApi.updateUser(userId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update user');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast({
        title: 'User Updated',
        description: 'User information has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}; 