import { useQuery } from '@tanstack/react-query';
import { dashboardApi, DashboardData, DashboardStats, AppointmentSummary } from '@/api/dashboard';

export const useDashboardData = (dateRange?: { from: Date; to: Date }) => {
  // Serialize dateRange to create stable query key
  const rangeKey = dateRange
    ? [dateRange.from.toISOString(), dateRange.to.toISOString()]
    : 'all';

  return useQuery({
    queryKey: ['dashboard', 'data', rangeKey],
    queryFn: async () => {
      const response = await dashboardApi.getDashboardData(dateRange);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch dashboard data');
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useDashboardStats = (dateRange?: { from: Date; to: Date }) => {
  // Serialize dateRange to create stable query key
  const rangeKey = dateRange
    ? [dateRange.from.toISOString(), dateRange.to.toISOString()]
    : 'all';

  return useQuery({
    queryKey: ['dashboard', 'stats', rangeKey],
    queryFn: async () => {
      const response = await dashboardApi.getDashboardStats(dateRange);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch dashboard stats');
      }
      return response.data!;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useUpcomingAppointments = (limit: number = 5) => {
  return useQuery({
    queryKey: ['dashboard', 'appointments', 'upcoming', limit],
    queryFn: async () => {
      const response = await dashboardApi.getUpcomingAppointments(limit);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch upcoming appointments');
      }
      return response.data!;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
  });
};

export const useRecentActivity = (limit: number = 10) => {
  return useQuery({
    queryKey: ['dashboard', 'activity', 'recent', limit],
    queryFn: async () => {
      const response = await dashboardApi.getRecentActivity(limit);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch recent activity');
      }
      return response.data!;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
  });
};

export const useChartData = (period: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
  return useQuery({
    queryKey: ['dashboard', 'charts', period],
    queryFn: async () => {
      const response = await dashboardApi.getChartData(period);
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch chart data');
      }
      return response.data!;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
