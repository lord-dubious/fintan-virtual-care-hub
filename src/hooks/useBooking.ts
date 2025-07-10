import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import {
  TimeSlot,
  BookingData,
  Appointment,
  ApiResponse
} from '@/types/api';

export interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  providerId?: string; // Which doctor this slot belongs to
  providerName?: string; // Doctor's name for display
}

export interface BookingRequest {
  date: string;
  startTime: string;
  endTime: string;
  consultationType: 'VIDEO' | 'AUDIO';
  notes?: string;
  providerId?: string; // Which doctor to book with
}

// Get availability slots (no provider ID needed)
export const useAvailabilitySlots = (
  startDate?: Date,
  endDate?: Date,
  slotDuration: number = 30
) => {
  return useQuery({
    queryKey: ['availability-slots', startDate?.toISOString(), endDate?.toISOString(), slotDuration],
    queryFn: async (): Promise<AvailabilitySlot[]> => {
      const params: Record<string, unknown> = { slotDuration };
      
      if (startDate) params.startDate = startDate.toISOString();
      if (endDate) params.endDate = endDate.toISOString();

      const response = await apiClient.get<ApiResponse<{ slots: AvailabilitySlot[] }>>('/availability/slots', { params });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch availability');
      }

      return response.data?.data?.slots || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Create a booking (no provider ID needed)
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookingData: BookingRequest) => {
      const response = await apiClient.post<ApiResponse<Appointment>>('/appointments', bookingData);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create booking');
      }

      return response.data?.data!;
    },
    onSuccess: () => {
      // Invalidate availability queries to refresh slots
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
      
      toast({
        title: "Booking Confirmed",
        description: "Your appointment has been successfully booked.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Get doctor info (simplified)
export const useDoctorInfo = () => {
  return useQuery({
    queryKey: ['doctor-info'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>('/availability/doctor-info');

      if (!response.data.success) {
        // Return default doctor info if API fails
        return {
          id: 'default',
          name: 'Dr. Fintan Ekochin',
          specialization: 'General Medicine & Wellness',
          consultationFee: 75.00,
          bio: 'Dr. Fintan Ekochin is a dedicated healthcare professional committed to providing comprehensive medical care.',
          avatarUrl: null,
          doctors: []
        };
      }

      return response.data?.data!;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get user's appointments
export const useMyAppointments = () => {
  return useQuery({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Appointment[]>>('/appointments/my');

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch appointments');
      }

      return response.data?.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
