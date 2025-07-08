import { QueryClient } from '@tanstack/react-query';

// Define types for better type safety
interface AppointmentData {
  id: string;
  status: string;
  [key: string]: unknown;
}

interface AppointmentsResponse {
  appointments: AppointmentData[];
  total?: number;
  [key: string]: unknown;
}

interface DashboardData {
  upcomingAppointments?: AppointmentData[];
  [key: string]: unknown;
}

// Optimized query client configuration for performance
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Stale time - how long data is considered fresh
        staleTime: 5 * 60 * 1000, // 5 minutes
        
        // Cache time - how long data stays in cache after component unmounts
        gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
        
        // Retry configuration
        retry: (failureCount, error: Error) => {
          // Don't retry on 4xx errors (client errors)
          if ('status' in error && typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        
        // Exponential backoff for retries
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Background refetch settings
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // Network mode - continue with cached data when offline
        networkMode: 'offlineFirst',
        
        // Keep previous data while fetching new data
        placeholderData: (previousData: unknown) => previousData, // Renamed from keepPreviousData in v5
      },
      mutations: {
        // Retry mutations once
        retry: 1,
        
        // Network mode for mutations
        networkMode: 'online',
      },
    },
    
    // Query cache configuration
    queryCache: undefined, // Use default
    
    // Mutation cache configuration  
    mutationCache: undefined, // Use default
  });
};

// Performance monitoring for queries
export const queryClientConfig = {
  // Global error handler
  onError: (error: unknown) => {
    console.error('Query error:', error);
    
    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking service
    }
  },
  
  // Global success handler
  onSuccess: (data: unknown) => {
    // Performance logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Query success:', data);
    }
  },
  
  // Memory management
  onSettled: () => {
    // Cleanup old queries periodically
    if (typeof window !== 'undefined') {
      // Clean up every 5 minutes
      setTimeout(() => {
        // This would be handled by the query client's garbage collection
      }, 5 * 60 * 1000);
    }
  },
};

// Prefetch strategies
export const prefetchStrategies = {
  // Prefetch user data on app load
  prefetchUserData: async (queryClient: QueryClient, userId: string) => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['user', userId],
        queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json()),
        staleTime: 10 * 60 * 1000, // 10 minutes
      }),
      queryClient.prefetchQuery({
        queryKey: ['user', userId, 'preferences'],
        queryFn: () => fetch(`/api/users/${userId}/preferences`).then(res => res.json()),
        staleTime: 30 * 60 * 1000, // 30 minutes
      }),
    ]);
  },
  
  // Prefetch dashboard data
  prefetchDashboardData: async (queryClient: QueryClient, userRole: string) => {
    if (userRole === 'PATIENT') {
      await queryClient.prefetchQuery({
        queryKey: ['patient', 'dashboard'],
        queryFn: () => fetch('/api/patients/dashboard').then(res => res.json()),
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    } else if (userRole === 'PROVIDER' || userRole === 'DOCTOR') {
      await queryClient.prefetchQuery({
        queryKey: ['provider', 'dashboard'],
        queryFn: () => fetch('/api/providers/dashboard').then(res => res.json()),
        staleTime: 2 * 60 * 1000, // 2 minutes
      });
    }
  },
  
  // Prefetch appointments
  prefetchAppointments: async (queryClient: QueryClient) => {
    await queryClient.prefetchQuery({
      queryKey: ['appointments'],
      queryFn: () => fetch('/api/appointments').then(res => res.json()),
      staleTime: 1 * 60 * 1000, // 1 minute
    });
  },
};

// Cache invalidation strategies
export const cacheInvalidation = {
  // Invalidate user-related data
  invalidateUserData: (queryClient: QueryClient, userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['user', userId] });
    queryClient.invalidateQueries({ queryKey: ['patient', 'dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['provider', 'dashboard'] });
  },

  // Invalidate appointment data
  invalidateAppointments: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    queryClient.invalidateQueries({ queryKey: ['patient', 'dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['provider', 'dashboard'] });
  },

  // Invalidate medical records
  invalidateMedicalRecords: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['medical-records'] });
    queryClient.invalidateQueries({ queryKey: ['patient', 'dashboard'] });
  },
};

// Optimistic update helpers
export const optimisticUpdates = {
  // Update appointment status optimistically
  updateAppointmentStatus: (
    queryClient: QueryClient,
    appointmentId: string,
    newStatus: string
  ) => {
    // Update appointments list
    queryClient.setQueryData(['appointments'], (oldData: AppointmentsResponse | undefined) => {
      if (!oldData?.appointments) return oldData;

      return {
        ...oldData,
        appointments: oldData.appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        ),
      };
    });
    
    // Update dashboard data
    queryClient.setQueryData(['patient', 'dashboard'], (oldData: DashboardData | undefined) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        upcomingAppointments: oldData.upcomingAppointments?.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        ),
      };
    });
  },
  
  // Add new appointment optimistically
  addAppointment: (queryClient: QueryClient, newAppointment: AppointmentData) => {
    queryClient.setQueryData(['appointments'], (oldData: AppointmentsResponse | undefined) => {
      if (!oldData?.appointments) return oldData;

      return {
        ...oldData,
        appointments: [newAppointment, ...oldData.appointments],
        total: (oldData.total || 0) + 1,
      };
    });
  },
};

// Background sync for offline support
export const backgroundSync = {
  // Sync pending mutations when coming back online
  syncPendingMutations: async (queryClient: QueryClient) => {
    // This would integrate with a service worker or background sync API
    // to replay failed mutations when connectivity is restored
    
    if (navigator.onLine) {
      // Retry failed mutations
      await queryClient.resumePausedMutations();
    }
  },
  
  // Prefetch critical data in background
  backgroundPrefetch: async (queryClient: QueryClient) => {
    // Prefetch data that's likely to be needed soon
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Prefetch during idle time
        prefetchStrategies.prefetchAppointments(queryClient);
      });
    }
  },
};

// Memory optimization
export const memoryOptimization = {
  // Clean up old cache entries
  cleanupCache: (queryClient: QueryClient) => {
    const cache = queryClient.getQueryCache();
    const now = Date.now();
    const maxAge = 30 * 60 * 1000; // 30 minutes
    
    cache.getAll().forEach((query) => {
      if (now - query.state.dataUpdatedAt > maxAge) {
        cache.remove(query);
      }
    });
  },
  
  // Limit cache size
  limitCacheSize: (queryClient: QueryClient, maxEntries = 100) => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    if (queries.length > maxEntries) {
      // Remove oldest queries
      queries
        .sort((a, b) => a.state.dataUpdatedAt - b.state.dataUpdatedAt)
        .slice(0, queries.length - maxEntries)
        .forEach((query) => cache.remove(query));
    }
  },
};
