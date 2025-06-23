// API Configuration for Dr. Fintan Virtual Care Hub
// This file centralizes all API-related configuration

// Backend API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Environment detection
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// API Configuration
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

// Mock API Configuration
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || false;

// Token storage keys
export const TOKEN_STORAGE_KEY = 'auth_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'refresh_token';
export const USER_STORAGE_KEY = 'current_user';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    RESET_PASSWORD: '/auth/reset-password',
    CONFIRM_RESET_PASSWORD: '/auth/confirm-reset-password',
    REFRESH_TOKEN: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    VERIFY_TOKEN: '/auth/verify-token',
  },
  
  // Appointments
  APPOINTMENTS: {
    BASE: '/appointments',
    BY_PATIENT: '/appointments/patient',
    BY_PROVIDER: '/appointments/provider',
    STATUS: (id: string) => `/appointments/${id}/status`,
    CANCEL: (id: string) => `/appointments/${id}/cancel`,
  },
  
  // Patients
  PATIENTS: {
    BASE: '/patients',
    PROFILE: (id: string) => `/patients/${id}`,
    APPOINTMENTS: (id: string) => `/patients/${id}/appointments`,
    MEDICAL_RECORDS: (id: string) => `/patients/${id}/medical-records`,
  },
  
  // Consultations
  CONSULTATIONS: {
    BASE: '/consultations',
    CREATE_ROOM: '/consultations/create-room',
    JOIN_ROOM: (id: string) => `/consultations/${id}/join`,
    NOTES: (id: string) => `/consultations/${id}/notes`,
  },
  
  // Payments
  PAYMENTS: {
    BASE: '/payments',
    CREATE_CHECKOUT: '/payments/create-checkout-session',
    CREATE_SESSION: '/payments/create-checkout-session',
    VERIFY: (provider: string, reference: string) => `/payments/verify/${provider}/${reference}`,
    REFUND: (id: string) => `/payments/${id}/refund`,
    CONFIG: '/payments/config',
    HISTORY: '/payments/history',
    INVOICES: '/payments/invoices',
  },
  
  // Admin
  ADMIN: {
    USERS: '/admin/users',
    APPOINTMENTS: '/admin/appointments',
    STATISTICS: '/admin/statistics',
    SETTINGS: '/admin/settings',
  },
  
  // Health Check
  HEALTH: '/health',
} as const;

export default {
  API_BASE_URL,
  API_CONFIG,
  USE_MOCK_API,
  API_ENDPOINTS,
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  isDevelopment,
  isProduction,
};
