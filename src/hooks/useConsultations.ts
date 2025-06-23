import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationsApi } from '@/api/consultations';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useConsultation = (id: string) => {
  return useQuery({
    queryKey: ['consultations', id],
    queryFn: async () => {
      const response = await consultationsApi.getConsultation(id);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch consultation');
      }
      return response.data!;
    },
    enabled: !!id,
  });
};

export const useConsultationByAppointment = (appointmentId: string) => {
  return useQuery({
    queryKey: ['consultations', 'appointment', appointmentId],
    queryFn: async () => {
      const response = await consultationsApi.getConsultationByAppointment(appointmentId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch consultation');
      }
      return response.data!;
    },
    enabled: !!appointmentId,
  });
};

export const useJoinConsultation = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await consultationsApi.joinConsultation(appointmentId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to join consultation');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      toast({
        title: "Joining Consultation",
        description: "Redirecting to your consultation room...",
      });
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

export const useUpdateConsultationNotes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ consultationId, notes }: { consultationId: string; notes: string }) => {
      const response = await consultationsApi.updateNotes(consultationId, notes);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update notes');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['consultations', data.id] });
      toast({
        title: "Notes Updated",
        description: "Your consultation notes have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Save Notes",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
