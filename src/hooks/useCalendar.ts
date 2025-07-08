import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarApi, AvailabilityRequest, DayAvailability, CalendarEvent } from '@/api/calendar';
import { useToast } from '@/hooks/use-toast';

export const useAvailability = (request: AvailabilityRequest) => {
  return useQuery<DayAvailability[], Error>({
    queryKey: ['calendar', 'availability', request],
    queryFn: async () => {
      const response = await calendarApi.getAvailability(request);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch availability');
      }
      return response.data!;
    },
    enabled: !!(request.providerId && request.dateFrom && request.dateTo),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDayAvailability = (providerId: string, date: Date) => {
  return useQuery({
    queryKey: ['calendar', 'availability', providerId, date.toISOString().split('T')[0]],
    queryFn: async () => {
      const response = await calendarApi.getDayAvailability(providerId, date);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch day availability');
      }
      return response.data!;
    },
    enabled: !!(providerId && date),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useProviderSchedule = (providerId: string) => {
  return useQuery({
    queryKey: ['calendar', 'schedule', providerId],
    queryFn: async () => {
      const response = await calendarApi.getProviderSchedule(providerId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch provider schedule');
      }
      return response.data!;
    },
    enabled: !!providerId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCalendarEvents = (providerId: string, dateFrom: Date, dateTo: Date) => {
  return useQuery({
    queryKey: ['calendar', 'events', providerId, dateFrom.toISOString(), dateTo.toISOString()],
    queryFn: async () => {
      const response = await calendarApi.getCalendarEvents(providerId, dateFrom, dateTo);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch calendar events');
      }
      return response.data!;
    },
    enabled: !!(providerId && dateFrom && dateTo),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBlockTimeSlot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: {
      providerId: string;
      date: Date;
      startTime: string;
      endTime: string;
      reason?: string;
    }) => {
      const response = await calendarApi.blockTimeSlot(request);
      if (!response.success) {
        throw new Error(response.error || 'Failed to block time slot');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'availability'] });
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      toast({
        title: "Time Slot Blocked",
        description: "The time slot has been blocked successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Block Time Slot",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUnblockTimeSlot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: {
      providerId: string;
      date: Date;
      startTime: string;
    }) => {
      const response = await calendarApi.unblockTimeSlot(request.providerId, request.date, request.startTime);
      if (!response.success) {
        throw new Error(response.error || 'Failed to unblock time slot');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'availability'] });
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      toast({
        title: "Time Slot Unblocked",
        description: "The time slot has been unblocked successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Unblock Time Slot",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (event: Omit<CalendarEvent, 'id'>) => {
      const response = await calendarApi.createCalendarEvent(event);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create calendar event');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar', 'availability'] });
      toast({
        title: "Event Created",
        description: "The calendar event has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Event",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useGenerateCalendarExport = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await calendarApi.generateCalendarExport(appointmentId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate calendar export');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      // Create and download the ICS file
      const blob = new Blob([data.icsContent], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Calendar Export Generated",
        description: "The calendar file has been downloaded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Generate Export",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
