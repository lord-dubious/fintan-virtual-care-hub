import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import {
  CalcomEventType,
  CalcomBooking,
  AvailableSlot,
  CreateBookingRequest,
  ApiResponse
} from '@/types/api';

// Re-export types for convenience
export type { CalcomEventType, CalcomBooking, AvailableSlot, CreateBookingRequest };

// Hook to get Cal.com event types
export const useCalcomEventTypes = () => {
  return useQuery({
    queryKey: ['calcom', 'event-types'],
    queryFn: async (): Promise<CalcomEventType[]> => {
      const response = await apiClient.get<ApiResponse<CalcomEventType[]>>('/api/calcom/event-types');
      return response.data?.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  });
};

// Hook to get available slots for an event type
export const useCalcomAvailableSlots = (
  eventTypeId: number | null,
  startDate: Date | null,
  endDate: Date | null,
  enabled = true
) => {
  return useQuery({
    queryKey: ['calcom', 'available-slots', eventTypeId, startDate?.toISOString(), endDate?.toISOString()],
    queryFn: async (): Promise<AvailableSlot[]> => {
      if (!eventTypeId || !startDate || !endDate) {
        return [];
      }

      const response = await apiClient.get<ApiResponse<AvailableSlot[]>>('/api/calcom/available-slots', {
        params: {
          eventTypeId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      return response.data?.data || [];
    },
    enabled: enabled && !!eventTypeId && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (renamed from cacheTime)
  });
};

// Hook to create a Cal.com booking
export const useCreateCalcomBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookingData: CreateBookingRequest): Promise<CalcomBooking> => {
      const response = await apiClient.post<ApiResponse<CalcomBooking>>('/api/calcom/bookings', bookingData);
      return response.data?.data!;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calcom', 'bookings'] });

      toast({
        title: "Booking Created",
        description: "Your appointment has been successfully booked.",
      });
    },
    onError: (error: unknown) => {
      console.error('Error creating Cal.com booking:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create booking. Please try again.";
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Hook to get a specific Cal.com booking
export const useCalcomBooking = (bookingId: number | null) => {
  return useQuery({
    queryKey: ['calcom', 'booking', bookingId],
    queryFn: async (): Promise<CalcomBooking> => {
      if (!bookingId) throw new Error('Booking ID is required');

      const response = await apiClient.get<ApiResponse<CalcomBooking>>(`/api/calcom/bookings/${bookingId}`);
      return response.data?.data!;
    },
    enabled: !!bookingId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes (renamed from cacheTime)
  });
};

// Hook to cancel a Cal.com booking
export const useCancelCalcomBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ bookingId, reason }: { bookingId: number; reason?: string }) => {
      const response = await apiClient.post(`/api/calcom/bookings/${bookingId}/cancel`, {
        reason,
      });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calcom', 'bookings'] });
      
      toast({
        title: "Booking Cancelled",
        description: "Your appointment has been successfully cancelled.",
      });
    },
    onError: (error: unknown) => {
      console.error('Error cancelling Cal.com booking:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to cancel booking. Please try again.";
      toast({
        title: "Cancellation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Hook to reschedule a Cal.com booking
export const useRescheduleCalcomBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      bookingId,
      startTime,
      endTime
    }: {
      bookingId: number;
      startTime: string;
      endTime: string;
    }): Promise<CalcomBooking> => {
      const response = await apiClient.post<ApiResponse<CalcomBooking>>(`/api/calcom/bookings/${bookingId}/reschedule`, {
        startTime,
        endTime,
      });
      return response.data?.data!;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['calcom', 'bookings'] });
      
      toast({
        title: "Booking Rescheduled",
        description: "Your appointment has been successfully rescheduled.",
      });
    },
    onError: (error: unknown) => {
      console.error('Error rescheduling Cal.com booking:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to reschedule booking. Please try again.";
      toast({
        title: "Reschedule Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Hook to sync user to Cal.com
export const useSyncUserToCalcom = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (): Promise<{ calcomUserId: number; email: string; name: string; username: string }> => {
      const response = await apiClient.post<ApiResponse<{ calcomUserId: number; email: string; name: string; username: string }>>('/api/calcom/sync-user');
      return response.data?.data!;
    },
    onSuccess: (data) => {
      toast({
        title: "Account Synced",
        description: "Your account has been synced with Cal.com.",
      });
    },
    onError: (error: unknown) => {
      console.error('Error syncing user to Cal.com:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to sync account. Please try again.";
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
};

// Hook to check Cal.com service health
export const useCalcomHealth = () => {
  return useQuery({
    queryKey: ['calcom', 'health'],
    queryFn: async (): Promise<{ status: string; eventTypesCount: number; timestamp: string }> => {
      const response = await apiClient.get<ApiResponse<{ status: string; eventTypesCount: number; timestamp: string }>>('/api/calcom/health');
      return response.data?.data!;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 2 * 60 * 1000, // 2 minutes (renamed from cacheTime)
    retry: 1,
  });
};

// Utility function to format Cal.com booking for display
export const formatCalcomBooking = (booking: CalcomBooking) => {
  return {
    id: booking.id,
    uid: booking.uid,
    title: booking.title,
    description: booking.description,
    startTime: new Date(booking.startTime),
    endTime: new Date(booking.endTime),
    duration: Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000),
    attendee: booking.attendees[0],
    organizer: booking.organizer,
    location: booking.location,
    status: booking.status,
    consultationType: booking.metadata?.consultationType || 'VIDEO',
    notes: booking.metadata?.notes,
  };
};

// Utility function to generate available time slots for a date
export const generateTimeSlots = (
  date: Date,
  startHour = 9,
  endHour = 17,
  intervalMinutes = 30
): string[] => {
  const slots: string[] = [];
  const currentDate = new Date(date);
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(time);
    }
  }
  
  return slots;
};

// Utility function to check if a time slot is in the past
export const isSlotInPast = (date: string, time: string): boolean => {
  const slotDateTime = new Date(`${date}T${time}`);
  return slotDateTime < new Date();
};
