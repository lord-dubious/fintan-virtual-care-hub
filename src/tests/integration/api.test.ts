import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/toast';
import PatientDashboard from '@/pages/PatientDashboard';
import DoctorDashboard from '@/pages/DoctorDashboard';
import { apiClient } from '@/api/client';

// Mock server setup
const mockServer = {
  baseURL: 'http://localhost:3001',
  isRunning: false,
  
  async start() {
    // In a real test, you'd start a test server here
    this.isRunning = true;
  },
  
  async stop() {
    this.isRunning = false;
  },
  
  mockResponse(endpoint: string, response: unknown) {
    // Mock API responses for testing
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes(endpoint)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(response),
        });
      }
      return Promise.reject(new Error(`Unmocked endpoint: ${url}`));
    });
  }
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Frontend-Backend Integration Tests', () => {
  beforeAll(async () => {
    await mockServer.start();
  });

  afterAll(async () => {
    await mockServer.stop();
  });

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  describe('Authentication Integration', () => {
    it('should handle successful login flow', async () => {
      const mockLoginResponse = {
        success: true,
        data: {
          user: {
            id: 'user-1',
            email: 'patient@test.com',
            name: 'Test Patient',
            role: 'PATIENT',
          },
          token: 'mock-jwt-token',
        },
      };

      mockServer.mockResponse('/api/auth/login', mockLoginResponse);

      // Test login API call
      const response = await apiClient.post('/api/auth/login', {
        email: 'patient@test.com',
        password: 'password123',
      });

      expect(response.success).toBe(true);
      expect(response.data.user.role).toBe('PATIENT');
    });

    it('should handle authentication errors', async () => {
      const mockErrorResponse = {
        success: false,
        error: 'Invalid credentials',
      };

      mockServer.mockResponse('/api/auth/login', mockErrorResponse);

      const response = await apiClient.post('/api/auth/login', {
        email: 'invalid@test.com',
        password: 'wrongpassword',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid credentials');
    });
  });

  describe('Patient Dashboard Integration', () => {
    it('should load patient dashboard data successfully', async () => {
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
              duration: 30,
              consultationType: 'VIDEO',
              provider: {
                name: 'Dr. Test',
                specialization: 'General Medicine',
              },
            },
          ],
          statistics: {
            totalAppointments: 5,
            completedAppointments: 3,
            totalMedicalRecords: 2,
          },
        },
      };

      mockServer.mockResponse('/api/patients/dashboard', mockDashboardData);

      // Mock authentication
      const mockUser = {
        id: 'user-1',
        email: 'patient@test.com',
        name: 'Test Patient',
        role: 'PATIENT',
      };

      render(
        <TestWrapper>
          <PatientDashboard />
        </TestWrapper>
      );

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Test Patient/i)).toBeInTheDocument();
      });

      // Check if appointment data is displayed
      await waitFor(() => {
        expect(screen.getByText(/Dr. Test/i)).toBeInTheDocument();
      });
    });

    it('should handle dashboard loading errors gracefully', async () => {
      mockServer.mockResponse('/api/patients/dashboard', {
        success: false,
        error: 'Failed to load dashboard data',
      });

      render(
        <TestWrapper>
          <PatientDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Dashboard Unavailable/i)).toBeInTheDocument();
      });
    });
  });

  describe('Doctor Dashboard Integration', () => {
    it('should load provider dashboard data successfully', async () => {
      const mockProviderData = {
        success: true,
        data: {
          provider: {
            id: 'provider-1',
            name: 'Dr. Test Provider',
            specialization: 'Cardiology',
          },
          todaysAppointments: [
            {
              id: 'apt-1',
              date: '2025-07-08T09:00:00.000Z',
              patient: {
                name: 'Test Patient',
                email: 'patient@test.com',
              },
            },
          ],
          statistics: {
            totalPatients: 50,
            todaysAppointmentCount: 3,
            completedAppointments: 25,
          },
        },
      };

      mockServer.mockResponse('/api/providers/dashboard', mockProviderData);

      render(
        <TestWrapper>
          <DoctorDashboard />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Good morning, Dr. Test/i)).toBeInTheDocument();
      });
    });
  });

  describe('Appointment Booking Integration', () => {
    it('should create appointment successfully', async () => {
      const mockCreateResponse = {
        success: true,
        data: {
          appointment: {
            id: 'apt-new',
            appointmentDate: '2025-07-08T14:00:00.000Z',
            status: 'SCHEDULED',
            provider: {
              user: { name: 'Dr. Test' },
            },
          },
        },
      };

      mockServer.mockResponse('/api/appointments', mockCreateResponse);

      const appointmentData = {
        providerId: 'provider-1',
        appointmentDate: '2025-07-08T14:00:00.000Z',
        consultationType: 'VIDEO',
        reason: 'General consultation',
      };

      const response = await apiClient.post('/api/appointments', appointmentData);

      expect(response.success).toBe(true);
      expect(response.data.appointment.status).toBe('SCHEDULED');
    });

    it('should handle appointment conflicts', async () => {
      const mockConflictResponse = {
        success: false,
        error: 'Time slot is not available',
      };

      mockServer.mockResponse('/api/appointments', mockConflictResponse);

      const response = await apiClient.post('/api/appointments', {
        providerId: 'provider-1',
        appointmentDate: '2025-07-08T10:00:00.000Z',
        consultationType: 'VIDEO',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('Time slot is not available');
    });
  });

  describe('Medical Records Integration', () => {
    it('should fetch medical records successfully', async () => {
      const mockRecordsResponse = {
        success: true,
        data: {
          medicalRecords: [
            {
              id: 'record-1',
              diagnosis: 'Hypertension',
              treatment: 'Medication prescribed',
              createdAt: '2025-07-01T10:00:00.000Z',
              provider: {
                user: { name: 'Dr. Test' },
              },
            },
          ],
          pagination: {
            total: 1,
            page: 1,
            limit: 10,
          },
        },
      };

      mockServer.mockResponse('/api/medical-records', mockRecordsResponse);

      const response = await apiClient.get('/api/medical-records');

      expect(response.success).toBe(true);
      expect(response.data.medicalRecords).toHaveLength(1);
      expect(response.data.medicalRecords[0].diagnosis).toBe('Hypertension');
    });
  });

  describe('Real-time Updates Integration', () => {
    it('should handle appointment status updates', async () => {
      const mockUpdateResponse = {
        success: true,
        data: {
          appointment: {
            id: 'apt-1',
            status: 'COMPLETED',
          },
        },
      };

      mockServer.mockResponse('/api/appointments/apt-1', mockUpdateResponse);

      const response = await apiClient.put('/api/appointments/apt-1', {
        status: 'COMPLETED',
      });

      expect(response.success).toBe(true);
      expect(response.data.appointment.status).toBe('COMPLETED');
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network errors gracefully', async () => {
      // Simulate network error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      try {
        await apiClient.get('/api/patients/dashboard');
      } catch (error) {
        expect(error.message).toBe('Network error');
      }
    });

    it('should handle server errors with proper status codes', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          success: false,
          error: 'Internal server error',
        }),
      });

      const response = await apiClient.get('/api/patients/dashboard');

      expect(response.success).toBe(false);
      expect(response.error).toBe('Internal server error');
    });
  });
});
