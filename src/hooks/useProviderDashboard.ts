import { apiClient } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface ProviderDashboardData {
  provider: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    specialization?: string;
    consultationFee?: number;
    isActive: boolean;
    isVerified: boolean;
    approvalStatus: string;
  };
  todaysAppointments: Array<{
    id: string;
    date: string;
    duration: number;
    consultationType: string;
    reason?: string;
    status: string;
    patient: {
      name: string;
      email: string;
      profilePicture?: string;
    };
  }>;
  upcomingAppointments: Array<{
    id: string;
    date: string;
    duration: number;
    consultationType: string;
    reason?: string;
    status: string;
    patient: {
      name: string;
    };
  }>;
  recentPatients: Array<{
    patientId: string;
    name: string;
    email: string;
    profilePicture?: string;
    lastVisit: string;
  }>;
  pendingTasks: Array<{
    type: string;
    count: number;
    description: string;
    priority: string;
  }>;
  statistics: {
    totalPatients: number;
    totalAppointments: number;
    completedAppointments: number;
    thisWeekAppointments: number;
    todaysAppointmentCount: number;
    upcomingAppointmentCount: number;
  };
  patientSummary: {
    totalPatients: number;
    newPatientsThisWeek: number;
    averageAppointmentsPerWeek: number;
  };
}

export const useProviderDashboard = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["provider", "dashboard"],
    queryFn: async () => {
      try {
        const response = await apiClient.get<ProviderDashboardData>(
          "/api/providers/dashboard"
        );

        if (!response.success) {
          throw new Error(
            response.error || "Failed to fetch provider dashboard data"
          );
        }

        return response.data!;
      } catch (error) {
        console.error("Provider dashboard fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Enable background updates
    refetchOnMount: "always",
    // Optimistic updates for better UX
    placeholderData: (previousData) => previousData,
    // Prefetch related data
    onSuccess: (data) => {
      // Pre-populate appointment cache if we have today's appointments
      if (data.todaysAppointments?.length > 0) {
        // This would help with faster navigation to appointments tab
      }
    },
  });
};

export const useProviderAppointments = (filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["provider", "appointments", filters],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/api/appointments", filters);

        if (!response.success) {
          throw new Error(response.error || "Failed to fetch appointments");
        }

        return response.data!;
      } catch (error) {
        console.error("Provider appointments fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load appointments. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!filters || true,
  });
};

export const useProviderPatients = (filters?: {
  limit?: number;
  search?: string;
}) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["provider", "patients", filters],
    queryFn: async () => {
      try {
        const response = await apiClient.get("/api/patients", filters);

        if (!response.success) {
          throw new Error(response.error || "Failed to fetch patients");
        }

        return response.data!;
      } catch (error) {
        console.error("Provider patients fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!filters || true,
  });
};

export const useProviderStats = (days: number = 30) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ["provider", "stats", days],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/providers/stats`, { days });

        if (!response.success) {
          throw new Error(
            response.error || "Failed to fetch provider statistics"
          );
        }

        return response.data!;
      } catch (error) {
        console.error("Provider stats fetch error:", error);
        toast({
          title: "Error",
          description: "Failed to load statistics. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
