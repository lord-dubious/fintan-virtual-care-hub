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

export const useAppointmentsByPatient = (patientId: string, filters?: Omit<AppointmentFilters, 'patientId'>) => {
  const serializedFilters = useMemo(
    () => (filters ? JSON.stringify(filters) : undefined),
    [filters]
  );

  return useQuery({
    queryKey: ['appointments', 'patient', patientId, serializedFilters],
    queryFn: async () => {
      const response = await appointmentsApi.getAppointmentsByPatient(patientId, filters);
      if (!response.success) {
        throw new Error(response.error || `Failed to fetch appointments for patient: ${response.error}`);
      }
      return response.data!;
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAppointmentsByProvider = (providerId: string, filters?: Omit<AppointmentFilters, 'providerId'>) => {
  const serializedFilters = useMemo(
    () => (filters ? JSON.stringify(filters) : undefined),
    [filters]
  );

  return useQuery({
    queryKey: ['appointments', 'provider', providerId, serializedFilters],
    queryFn: async () => {
      const response = await appointmentsApi.getAppointmentsByProvider(providerId, filters);
      if (!response.success) {
        throw new Error(response.error || `Failed to fetch appointments for provider: ${response.error}`);
      }
      return response.data!;
    },
    enabled: !!providerId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCalendarAppointments = (providerId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['appointments', 'calendar', providerId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const response = await appointmentsApi.getAppointmentsForCalendar(providerId, startDate, endDate);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch calendar appointments');
      }
      return response.data!;
    },
    enabled: !!(providerId && startDate && endDate),
    staleTime: 1 * 60 * 1000, // 1 minute for calendar view
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
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: "Appointment Created",
        description: "The appointment has been scheduled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Appointment",
        description: error.message || "There was an error creating the appointment. Please try again later.",
        variant: "destructive",
      });
      console.error("[Appointment Creation Error]", error);
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
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: "Appointment Updated",
        description: "The appointment has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Appointment",
        description: error.message || "There was an error updating the appointment. Please try again later.",
        variant: "destructive",
      });
      console.error("[Appointment Update Error]", error);
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been cancelled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Cancel Appointment",
        description: error.message || "There was an error cancelling the appointment. Please try again later.",
        variant: "destructive",
      });
      console.error("[Appointment Cancellation Error]", error);
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({
        title: "Appointment Rescheduled",
        description: "The appointment has been rescheduled successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Reschedule Appointment",
        description: error.message || "There was an error rescheduling the appointment. Please try again later.",
        variant: "destructive",
      });
      console.error("[Appointment Reschedule Error]", error);
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
        description: error.message || "There was an error joining the consultation. Please try again or contact support.",
        variant: "destructive",
      });
      console.error("[Join Consultation Error]", error);
    },
  });
};

export const useAppointmentStats = () => {
  const { toast } = useToast();
  
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
    onError: (error: Error) => {
      toast({
        title: "Failed to Load Statistics",
        description: "There was an error loading appointment statistics.",
        variant: "destructive",
      });
      console.error("[Appointment Stats Error]", error);
    }
  });
};

export const useUpdateAppointmentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: Appointment['status']; notes?: string }) => {
      const response = await appointmentsApi.updateAppointmentStatus(id, status, notes);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update appointment status');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      const statusMessages = {
        'SCHEDULED': 'scheduled',
        'CONFIRMED': 'confirmed',
        'IN_PROGRESS': 'started',
        'COMPLETED': 'completed',
        'CANCELLED': 'cancelled',
        'NO_SHOW': 'marked as no-show'
      };
      
      toast({
        title: "Status Updated",
        description: `The appointment has been ${statusMessages[data.status] || 'updated'} successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Status",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await appointmentsApi.confirmAppointment(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to confirm appointment');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: "Appointment Confirmed",
        description: "The appointment has been confirmed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Confirm Appointment",
        description: error.message || "There was an error confirming the appointment. Please try again later.",
        variant: "destructive",
      });
      console.error("[Appointment Confirmation Error]", error);
    },
  });
};

export const useMarkNoShow = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await appointmentsApi.markNoShow(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to mark appointment as no-show');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: "Marked as No-Show",
        description: "The appointment has been marked as no-show.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Mark as No-Show",
        description: error.message || "There was an error updating the appointment status. Please try again later.",
        variant: "destructive",
      });
      console.error("[Appointment No-Show Error]", error);
    },
  });
};
