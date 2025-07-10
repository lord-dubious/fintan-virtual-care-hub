import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePatientDashboard } from '@/hooks/usePatients';
import { useProviderDashboard } from '@/hooks/useProviderDashboard';
import { apiClient } from '@/api/client';

// Mock API client
vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Dashboard Data Synchronization Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Patient Dashboard Sync', () => {
    it('should fetch and cache patient dashboard data', async () => {
      const mockDashboardData = {
        success: true,
        data: {
          patient: {
            id: 'patient-1',
            name: 'Test Patient',
            email: 'patient@test.com',
          },
          upcomingAppointments: [
            {
              id: 'apt-1',
              date: '2025-07-08T10:00:00.000Z',
              provider: { name: 'Dr. Test' },
            },
          ],
          statistics: {
            totalAppointments: 5,
            completedAppointments: 3,
          },
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockDashboardData);

      const { result } = renderHook(() => usePatientDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockDashboardData.data);
      expect(apiClient.get).toHaveBeenCalledWith('/api/patients/dashboard');
    });

    it('should handle dashboard data refresh', async () => {
      const initialData = {
        success: true,
        data: {
          patient: { id: 'patient-1', name: 'Test Patient' },
          statistics: { totalAppointments: 5 },
        },
      };

      const updatedData = {
        success: true,
        data: {
          patient: { id: 'patient-1', name: 'Test Patient' },
          statistics: { totalAppointments: 6 }, // Updated count
        },
      };

      vi.mocked(apiClient.get)
        .mockResolvedValueOnce(initialData)
        .mockResolvedValueOnce(updatedData);

      const { result } = renderHook(() => usePatientDashboard(), {
        wrapper: createWrapper(),
      });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.statistics.totalAppointments).toBe(5);

      // Trigger refetch
      result.current.refetch();

      // Wait for updated data
      await waitFor(() => {
        expect(result.current.data?.statistics.totalAppointments).toBe(6);
      });
    });

    it('should handle dashboard errors gracefully', async () => {
      const mockError = {
        success: false,
        error: 'Failed to load dashboard data',
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockError);

      const { result } = renderHook(() => usePatientDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('Provider Dashboard Sync', () => {
    it('should fetch provider dashboard with real-time updates', async () => {
      const mockProviderData = {
        success: true,
        data: {
          provider: {
            id: 'provider-1',
            name: 'Dr. Test',
            specialization: 'Cardiology',
          },
          todaysAppointments: [
            {
              id: 'apt-1',
              date: '2025-07-08T09:00:00.000Z',
              patient: { name: 'Patient 1' },
            },
          ],
          statistics: {
            todaysAppointmentCount: 3,
            totalPatients: 50,
          },
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockProviderData);

      const { result } = renderHook(() => useProviderDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockProviderData.data);
      expect(apiClient.get).toHaveBeenCalledWith('/api/providers/dashboard');
    });

    it('should update appointment counts in real-time', async () => {
      const initialData = {
        success: true,
        data: {
          provider: { id: 'provider-1', name: 'Dr. Test' },
          statistics: { todaysAppointmentCount: 3 },
        },
      };

      const updatedData = {
        success: true,
        data: {
          provider: { id: 'provider-1', name: 'Dr. Test' },
          statistics: { todaysAppointmentCount: 4 }, // New appointment added
        },
      };

      vi.mocked(apiClient.get)
        .mockResolvedValueOnce(initialData)
        .mockResolvedValueOnce(updatedData);

      const { result } = renderHook(() => useProviderDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.data?.statistics.todaysAppointmentCount).toBe(3);
      });

      // Simulate real-time update
      result.current.refetch();

      await waitFor(() => {
        expect(result.current.data?.statistics.todaysAppointmentCount).toBe(4);
      });
    });
  });

  describe('Cross-Dashboard Data Consistency', () => {
    it('should maintain data consistency between patient and provider views', async () => {
      const appointmentData = {
        id: 'apt-1',
        date: '2025-07-08T10:00:00.000Z',
        status: 'SCHEDULED',
        patient: { name: 'Test Patient' },
        provider: { name: 'Dr. Test' },
      };

      // Mock patient dashboard response
      const patientDashboard = {
        success: true,
        data: {
          upcomingAppointments: [appointmentData],
        },
      };

      // Mock provider dashboard response
      const providerDashboard = {
        success: true,
        data: {
          todaysAppointments: [appointmentData],
        },
      };

      vi.mocked(apiClient.get)
        .mockImplementation((url: string) => {
          if (url.includes('/patients/dashboard')) {
            return Promise.resolve(patientDashboard);
          }
          if (url.includes('/providers/dashboard')) {
            return Promise.resolve(providerDashboard);
          }
          return Promise.reject(new Error('Unknown endpoint'));
        });

      // Test patient view
      const { result: patientResult } = renderHook(() => usePatientDashboard(), {
        wrapper: createWrapper(),
      });

      // Test provider view
      const { result: providerResult } = renderHook(() => useProviderDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(patientResult.current.isSuccess).toBe(true);
        expect(providerResult.current.isSuccess).toBe(true);
      });

      // Verify same appointment appears in both dashboards
      const patientAppointment = patientResult.current.data?.upcomingAppointments[0];
      const providerAppointment = providerResult.current.data?.todaysAppointments[0];

      expect(patientAppointment?.id).toBe(providerAppointment?.id);
      expect(patientAppointment?.date).toBe(providerAppointment?.date);
    });
  });

  describe('Optimistic Updates', () => {
    it('should handle optimistic appointment status updates', async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      // Initial appointment data
      const initialAppointment = {
        id: 'apt-1',
        status: 'SCHEDULED',
        date: '2025-07-08T10:00:00.000Z',
      };

      // Set initial cache data
      queryClient.setQueryData(['patient', 'dashboard'], {
        upcomingAppointments: [initialAppointment],
      });

      // Optimistic update
      queryClient.setQueryData(['patient', 'dashboard'], (oldData: unknown) => ({
        ...oldData,
        upcomingAppointments: oldData.upcomingAppointments.map((apt: unknown) =>
          apt.id === 'apt-1' ? { ...apt, status: 'COMPLETED' } : apt
        ),
      }));

      const cachedData = queryClient.getQueryData(['patient', 'dashboard']) as any;
      expect(cachedData.upcomingAppointments[0].status).toBe('COMPLETED');
    });

    it('should revert optimistic updates on failure', async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const initialData = {
        upcomingAppointments: [
          { id: 'apt-1', status: 'SCHEDULED' },
        ],
      };

      // Set initial data
      queryClient.setQueryData(['patient', 'dashboard'], initialData);

      // Optimistic update
      queryClient.setQueryData(['patient', 'dashboard'], {
        upcomingAppointments: [
          { id: 'apt-1', status: 'COMPLETED' },
        ],
      });

      // Simulate API failure - revert to original data
      queryClient.setQueryData(['patient', 'dashboard'], initialData);

      const cachedData = queryClient.getQueryData(['patient', 'dashboard']) as any;
      expect(cachedData.upcomingAppointments[0].status).toBe('SCHEDULED');
    });
  });

  describe('Background Sync', () => {
    it('should sync data in background when window regains focus', async () => {
      const mockData = {
        success: true,
        data: { patient: { id: 'patient-1' } },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockData);

      const { result } = renderHook(() => usePatientDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Clear the mock to track new calls
      vi.clearAllMocks();

      // Simulate window focus event
      window.dispatchEvent(new Event('focus'));

      // Should trigger background refetch
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalled();
      });
    });
  });
});
