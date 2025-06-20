import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, Appointment, AppointmentFilters, CreateAppointmentData, UpdateAppointmentData } from '@/api/appointments';
import { useToast } from '@/hooks/use-toast';
import { useMemo } from 'react';

export const useAppointments = (filters?: AppointmentFilters) => {
  const serializedFilters = useMemo(
    () => (filters ? JSON.stringify(filters) : undefined),
    [filters]
  );

  return useQuery({
    queryKey: ['appointments', serializedFilters],
    queryFn: async () => {
      const response = await appointmentsApi.getAppointments(filters);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch appointments');
      }
      return response.data!;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: async () => {
      const response = await appointmentsApi.getAppointment(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch appointment');
      }
      return response.data!;
    },
    enabled: !!id,
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAppointmentData) => {
      const response = await appointmentsApi.createAppointment(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create appointment');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: "Appointment Created",
        description: "The appointment has been scheduled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAppointmentData }) => {
      const response = await appointmentsApi.updateAppointment(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update appointment');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: "Appointment Updated",
        description: "The appointment has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await appointmentsApi.cancelAppointment(id, reason);
      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel appointment');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been cancelled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Cancel Appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, newDate }: { id: string; newDate: Date }) => {
      const response = await appointmentsApi.rescheduleAppointment(id, newDate);
      if (!response.success) {
        throw new Error(response.error || 'Failed to reschedule appointment');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: "Appointment Rescheduled",
        description: "The appointment has been rescheduled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Reschedule Appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useJoinConsultation = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await appointmentsApi.joinConsultation(appointmentId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to join consultation');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      // Redirect to consultation page
      window.open(`/consultation?session=${data.sessionId}&id=${data.appointmentId}`, '_blank');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Join Consultation",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useAppointmentStats = () => {
  return useQuery({
    queryKey: ['appointments', 'stats'],
    queryFn: async () => {
      const response = await appointmentsApi.getAppointmentStats();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch appointment statistics');
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
