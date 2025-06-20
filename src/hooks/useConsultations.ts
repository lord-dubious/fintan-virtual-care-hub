import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationsApi, Consultation, CreateConsultationData, UpdateConsultationData } from '@/api/consultations';
import { useToast } from '@/hooks/use-toast';

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

export const useCreateConsultation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateConsultationData) => {
      const response = await consultationsApi.createConsultation(data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create consultation');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Consultation Created",
        description: "The consultation room has been set up successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Consultation",
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
      const response = await consultationsApi.joinConsultation(appointmentId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to join consultation');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      // The consultation page will handle the actual joining
      toast({
        title: "Joining Consultation",
        description: "Setting up your consultation room...",
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

export const useStartConsultation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (consultationId: string) => {
      const response = await consultationsApi.startConsultation(consultationId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to start consultation');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      toast({
        title: "Consultation Started",
        description: "The consultation has begun.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Start Consultation",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useEndConsultation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ consultationId, notes }: { consultationId: string; notes?: string }) => {
      const response = await consultationsApi.endConsultation(consultationId, notes);
      if (!response.success) {
        throw new Error(response.error || 'Failed to end consultation');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Consultation Ended",
        description: "The consultation has been completed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to End Consultation",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRequestVideo = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (consultationId: string) => {
      const response = await consultationsApi.requestVideo(consultationId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to request video');
      }
      return response.data!;
    },
    onSuccess: () => {
      toast({
        title: "Video Requested",
        description: "Video request sent to the other participant.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Request Video",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useEnableVideo = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (consultationId: string) => {
      const response = await consultationsApi.enableVideo(consultationId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to enable video');
      }
      return response.data!;
    },
    onSuccess: () => {
      toast({
        title: "Video Enabled",
        description: "Video has been enabled for this consultation.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Enable Video",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useStartRecording = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (consultationId: string) => {
      const response = await consultationsApi.startRecording(consultationId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to start recording');
      }
      return response.data!;
    },
    onSuccess: () => {
      toast({
        title: "Recording Started",
        description: "The consultation is now being recorded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Start Recording",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useStopRecording = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (consultationId: string) => {
      const response = await consultationsApi.stopRecording(consultationId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to stop recording');
      }
      return response.data!;
    },
    onSuccess: () => {
      toast({
        title: "Recording Stopped",
        description: "The recording has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Stop Recording",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useShareScreen = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (consultationId: string) => {
      const response = await consultationsApi.shareScreen(consultationId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to start screen sharing');
      }
      return response.data!;
    },
    onSuccess: () => {
      toast({
        title: "Screen Sharing Started",
        description: "You are now sharing your screen.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Share Screen",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useStopScreenShare = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (consultationId: string) => {
      const response = await consultationsApi.stopScreenShare(consultationId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to stop screen sharing');
      }
      return response.data!;
    },
    onSuccess: () => {
      toast({
        title: "Screen Sharing Stopped",
        description: "Screen sharing has been disabled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Stop Screen Sharing",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useConsultationMessages = (consultationId: string) => {
  return useQuery({
    queryKey: ['consultations', consultationId, 'messages'],
    queryFn: async () => {
      const response = await consultationsApi.getMessages(consultationId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch messages');
      }
      return response.data!;
    },
    enabled: !!consultationId,
    refetchInterval: 2000, // Poll for new messages every 2 seconds
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ consultationId, message }: { consultationId: string; message: string }) => {
      const response = await consultationsApi.sendMessage(consultationId, message);
      if (!response.success) {
        throw new Error(response.error || 'Failed to send message');
      }
      return response.data!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['consultations', variables.consultationId, 'messages'] });
    },
  });
};
