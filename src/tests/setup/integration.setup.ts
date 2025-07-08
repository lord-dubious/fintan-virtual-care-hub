import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Global test setup for integration tests

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:3001';
process.env.VITE_APP_URL = 'http://localhost:10000';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console errors/warnings in tests unless they're test-related
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('Error:'))
    ) {
      return;
    }
    originalConsoleError(...args);
  };

  console.warn = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return;
    }
    originalConsoleWarn(...args);
  };
});

afterAll(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
  
  // Reset localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  // Reset sessionStorage
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  // Reset fetch mock
  vi.mocked(fetch).mockClear();
});

afterEach(() => {
  // Clean up DOM after each test
  cleanup();
  
  // Clear any timers
  vi.clearAllTimers();
});

// Helper functions for tests
export const mockApiResponse = (data: any, success = true) => {
  return {
    ok: success,
    status: success ? 200 : 400,
    json: () => Promise.resolve({
      success,
      data: success ? data : undefined,
      error: success ? undefined : data,
    }),
  };
};

export const mockAuthenticatedUser = (role: 'PATIENT' | 'PROVIDER' | 'DOCTOR' | 'ADMIN' = 'PATIENT') => {
  const user = {
    id: `user-${role.toLowerCase()}`,
    email: `${role.toLowerCase()}@test.com`,
    name: `Test ${role}`,
    role,
  };

  localStorageMock.getItem.mockImplementation((key: string) => {
    if (key === 'auth-token') return 'mock-jwt-token';
    if (key === 'user') return JSON.stringify(user);
    return null;
  });

  return user;
};

export const mockUnauthenticatedUser = () => {
  localStorageMock.getItem.mockReturnValue(null);
};

export const createMockAppointment = (overrides = {}) => {
  return {
    id: 'apt-1',
    appointmentDate: '2025-07-08T10:00:00.000Z',
    duration: 30,
    consultationType: 'VIDEO',
    status: 'SCHEDULED',
    reason: 'General consultation',
    patient: {
      id: 'patient-1',
      user: {
        name: 'Test Patient',
        email: 'patient@test.com',
      },
    },
    provider: {
      id: 'provider-1',
      user: {
        name: 'Dr. Test',
        email: 'doctor@test.com',
      },
      specialization: 'General Medicine',
    },
    ...overrides,
  };
};

export const createMockMedicalRecord = (overrides = {}) => {
  return {
    id: 'record-1',
    diagnosis: 'Hypertension',
    treatment: 'Medication prescribed',
    prescription: 'Lisinopril 10mg daily',
    notes: 'Patient responding well to treatment',
    createdAt: '2025-07-01T10:00:00.000Z',
    provider: {
      user: {
        name: 'Dr. Test',
      },
    },
    ...overrides,
  };
};

export const createMockDashboardData = (role: 'patient' | 'provider' = 'patient') => {
  if (role === 'patient') {
    return {
      patient: {
        id: 'patient-1',
        name: 'Test Patient',
        email: 'patient@test.com',
      },
      upcomingAppointments: [createMockAppointment()],
      recentAppointments: [],
      recentActivity: [],
      medicalRecords: [createMockMedicalRecord()],
      statistics: {
        totalAppointments: 5,
        completedAppointments: 3,
        cancelledAppointments: 1,
        totalMedicalRecords: 2,
      },
      nextAppointment: {
        id: 'apt-1',
        date: '2025-07-08T10:00:00.000Z',
        provider: 'Dr. Test',
        consultationType: 'VIDEO',
      },
    };
  }

  return {
    provider: {
      id: 'provider-1',
      name: 'Dr. Test',
      email: 'doctor@test.com',
      specialization: 'General Medicine',
    },
    todaysAppointments: [createMockAppointment()],
    upcomingAppointments: [],
    recentPatients: [],
    pendingTasks: [],
    statistics: {
      totalPatients: 50,
      totalAppointments: 100,
      completedAppointments: 80,
      thisWeekAppointments: 15,
      todaysAppointmentCount: 3,
      upcomingAppointmentCount: 5,
    },
    patientSummary: {
      totalPatients: 50,
      newPatientsThisWeek: 3,
      averageAppointmentsPerWeek: 15,
    },
  };
};

// Network simulation helpers
export const simulateNetworkDelay = (ms = 100) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const simulateNetworkError = () => {
  return Promise.reject(new Error('Network error'));
};

export const simulateServerError = (status = 500, message = 'Internal server error') => {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve({
      success: false,
      error: message,
    }),
  });
};

// Test data generators
export const generateTestAppointments = (count = 5) => {
  return Array.from({ length: count }, (_, index) => 
    createMockAppointment({
      id: `apt-${index + 1}`,
      appointmentDate: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
    })
  );
};

export const generateTestMedicalRecords = (count = 3) => {
  return Array.from({ length: count }, (_, index) =>
    createMockMedicalRecord({
      id: `record-${index + 1}`,
      diagnosis: `Diagnosis ${index + 1}`,
    })
  );
};
