
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  appointmentsApi,
  CreateAppointmentData,
  UpdateAppointmentData,
  AppointmentFilters
} from '@/api/appointments';

export const useAppointments = (filters?: AppointmentFilters) => {
  const queryClient = useQueryClient();

  const appointments = useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      const response = await appointmentsApi.getAppointments(filters);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch appointments');
      }
      return response.data!;
    },
  });

  const upcomingAppointments = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: async () => {
      const response = await appointmentsApi.getUpcomingAppointments();
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch upcoming appointments');
      }
      return response.data!;
    },
  });

  const useAppointmentById = (id: string) => useQuery({
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

  const createAppointment = useMutation({
    mutationFn: async (newAppointment: CreateAppointmentData) => {
      const response = await appointmentsApi.createAppointment(newAppointment);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create appointment');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: UpdateAppointmentData }) => {
      const response = await appointmentsApi.updateAppointment(id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update appointment');
      }
      return response.data!;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const response = await appointmentsApi.cancelAppointment(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel appointment');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  return {
    appointments,
    upcomingAppointments,
    useAppointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment
  };
};
