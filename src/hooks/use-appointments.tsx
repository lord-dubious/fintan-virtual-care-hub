
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentService, AppointmentCreateInput, AppointmentUpdateInput } from '@/lib/services/appointmentService';

export const useAppointments = () => {
  const queryClient = useQueryClient();

  const appointments = useQuery({
    queryKey: ['appointments'],
    queryFn: appointmentService.getAll,
  });

  const upcomingAppointments = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: appointmentService.getUpcoming,
  });

  const appointmentById = (id: string) => useQuery({
    queryKey: ['appointments', id],
    queryFn: () => appointmentService.getById(id),
    enabled: !!id,
  });

  const createAppointment = useMutation({
    mutationFn: (newAppointment: AppointmentCreateInput) => 
      appointmentService.create(newAppointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  const updateAppointment = useMutation({
    mutationFn: ({ id, data }: { id: string, data: AppointmentUpdateInput }) => 
      appointmentService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', id] });
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: (id: string) => 
      appointmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  return {
    appointments,
    upcomingAppointments,
    appointmentById,
    createAppointment,
    updateAppointment,
    deleteAppointment
  };
};
