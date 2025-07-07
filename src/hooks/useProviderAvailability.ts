import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useToast } from '@/hooks/use-toast';

export interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  reason?: string;
}

export interface ConflictDetails {
  type: 'appointment' | 'break' | 'unavailable' | 'outside_hours' | 'buffer_violation';
  severity: 'error' | 'warning' | 'info';
  message: string;
  conflictingItem?: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    type: string;
  };
  suggestedAlternatives?: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface ConflictCheckResult {
  isValid: boolean;
  conflicts: ConflictDetails[];
  warnings: ConflictDetails[];
  suggestions: ConflictDetails[];
}

export interface ProviderSchedule {
  id: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  timezone: string;
  weeklyAvailability: {
    dayOfWeek: string;
    isAvailable: boolean;
    startTime: string;
    endTime: string;
  }[];
  breakPeriods: {
    id: string;
    dayOfWeek?: string;
    startTime: string;
    endTime: string;
    title?: string;
    isRecurring: boolean;
  }[];
  scheduleExceptions: {
    id: string;
    date: string;
    type: string;
    title: string;
    notes?: string;
  }[];
}

// Hook to get provider availability slots
export const useProviderAvailability = (
  providerId: string,
  startDate: Date,
  endDate: Date,
  slotDuration: number = 30
) => {
  return useQuery({
    queryKey: ['provider-availability', providerId, startDate.toISOString(), endDate.toISOString(), slotDuration],
    queryFn: async (): Promise<AvailabilitySlot[]> => {
      const response = await apiClient.get('/api/availability/slots', {
        params: {
          providerId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          slotDuration
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch availability');
      }

      return response.data.data.slots;
    },
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Hook to check appointment conflicts
export const useConflictCheck = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      providerId,
      appointmentDate,
      duration,
      patientId,
      excludeAppointmentId
    }: {
      providerId: string;
      appointmentDate: Date;
      duration: number;
      patientId?: string;
      excludeAppointmentId?: string;
    }): Promise<ConflictCheckResult> => {
      const response = await apiClient.post('/api/availability/check-conflicts', {
        providerId,
        appointmentDate: appointmentDate.toISOString(),
        duration,
        patientId,
        excludeAppointmentId
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to check conflicts');
      }

      return response.data.data;
    },
    onError: (error) => {
      console.error('Conflict check failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to check appointment conflicts. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

// Hook to get provider schedules
export const useProviderSchedules = (providerId?: string) => {
  return useQuery({
    queryKey: ['provider-schedules', providerId],
    queryFn: async (): Promise<ProviderSchedule[]> => {
      const response = await apiClient.get('/api/availability/schedules');

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch schedules');
      }

      return response.data.data.schedules;
    },
    enabled: !!providerId,
  });
};

// Hook to create/update provider schedule
export const useScheduleMutation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSchedule = useMutation({
    mutationFn: async (scheduleData: any) => {
      const response = await apiClient.post('/api/availability/schedules', scheduleData);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create schedule');
      }

      return response.data.data.schedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-schedules'] });
      toast({
        title: 'Success',
        description: 'Schedule created successfully',
      });
    },
    onError: (error) => {
      console.error('Schedule creation failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to create schedule. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, ...scheduleData }: { id: string } & any) => {
      const response = await apiClient.put(`/api/availability/schedules/${id}`, scheduleData);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to update schedule');
      }

      return response.data.data.schedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['provider-availability'] });
      toast({
        title: 'Success',
        description: 'Schedule updated successfully',
      });
    },
    onError: (error) => {
      console.error('Schedule update failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to update schedule. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/availability/schedules/${id}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to delete schedule');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['provider-availability'] });
      toast({
        title: 'Success',
        description: 'Schedule deleted successfully',
      });
    },
    onError: (error) => {
      console.error('Schedule deletion failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete schedule. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
};

// Hook to manage schedule exceptions (time off)
export const useScheduleExceptions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addException = useMutation({
    mutationFn: async ({ scheduleId, ...exceptionData }: { scheduleId: string } & any) => {
      const response = await apiClient.post(`/api/availability/schedules/${scheduleId}/exceptions`, exceptionData);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to add exception');
      }

      return response.data.data.exception;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['provider-availability'] });
      toast({
        title: 'Success',
        description: 'Time off scheduled successfully',
      });
    },
    onError: (error) => {
      console.error('Exception creation failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule time off. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const removeException = useMutation({
    mutationFn: async (exceptionId: string) => {
      const response = await apiClient.delete(`/api/availability/exceptions/${exceptionId}`);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to remove exception');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['provider-availability'] });
      toast({
        title: 'Success',
        description: 'Time off removed successfully',
      });
    },
    onError: (error) => {
      console.error('Exception removal failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove time off. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    addException,
    removeException,
  };
};

// Hook to validate schedule changes
export const useScheduleValidation = () => {
  return useMutation({
    mutationFn: async ({
      scheduleId,
      weeklyAvailability,
      breakPeriods,
      exceptions
    }: {
      scheduleId: string;
      weeklyAvailability: any[];
      breakPeriods: any[];
      exceptions?: any[];
    }) => {
      const response = await apiClient.post('/api/availability/validate-schedule', {
        scheduleId,
        weeklyAvailability,
        breakPeriods,
        exceptions
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to validate schedule');
      }

      return response.data.data;
    },
  });
};
