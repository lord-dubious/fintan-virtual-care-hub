import { Request } from 'express';
import { User } from '@prisma/client';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  userId?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'PATIENT' | 'PROVIDER';
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  additionalInfo?: any;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// User types
export type UserRole = 'PATIENT' | 'PROVIDER' | 'ADMIN' | 'DOCTOR';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Patient types
export interface PatientProfile {
  id: string;
  userId: string;
  dateOfBirth?: Date;
  address?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    surgeries: string[];
  };
  insurance?: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  preferences?: {
    language: string;
    communicationMethod: 'EMAIL' | 'SMS' | 'BOTH';
    appointmentReminders: boolean;
  };
}

// Provider types
export interface ProviderProfile {
  id: string;
  userId: string;
  specialization?: string;
  bio?: string;
  education?: {
    degree: string;
    institution: string;
    year: number;
  }[];
  experience?: {
    position: string;
    organization: string;
    startYear: number;
    endYear?: number;
  }[];
  licenseNumber?: string;
  isVerified: boolean;
  isActive: boolean;
  consultationFee?: number;
}

// Appointment types
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type ConsultationType = 'VIDEO' | 'AUDIO';

export interface AppointmentData {
  patientId: string;
  providerId: string;
  appointmentDate: Date;
  consultationType: ConsultationType;
  reason?: string;
  duration?: number; // in minutes
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  consultationType?: ConsultationType;
  dateFrom?: Date;
  dateTo?: Date;
  patientId?: string;
  providerId?: string;
  page?: number;
  limit?: number;
}

// Consultation types
export type ConsultationStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ConsultationData {
  appointmentId: string;
  roomUrl: string;
  videoEnabled?: boolean;
  notes?: string;
}

export interface JoinConsultationResponse {
  sessionId: string;
  appointmentId: string;
  roomUrl: string;
  token: string;
}

// Payment types
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
export type PaymentMethod = 'STRIPE' | 'PAYSTACK' | 'PAYPAL' | 'FLUTTERWAVE';

export interface PaymentData {
  patientId: string;
  appointmentId?: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  metadata?: any;
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

// Medical Record types
export interface MedicalRecordData {
  patientId: string;
  providerId: string;
  consultationId?: string;
  diagnosis?: string;
  notes?: string;
  prescriptions?: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  attachments?: {
    filename: string;
    url: string;
    type: string;
  }[];
}

// Availability types
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface AvailabilitySlot {
  id: string;
  providerId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  isAvailable: boolean;
}

export interface AvailabilityRequest {
  providerId: string;
  dateFrom: Date;
  dateTo: Date;
  consultationType?: ConsultationType;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD format
  slots: {
    time: string; // HH:MM format
    available: boolean;
    appointmentId?: string;
  }[];
}

// Notification types
export type NotificationType = 'APPOINTMENT_REMINDER' | 'APPOINTMENT_CONFIRMED' | 'APPOINTMENT_CANCELLED' | 'PAYMENT_RECEIVED' | 'CONSULTATION_READY' | 'SYSTEM_NOTIFICATION';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  link?: string;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Health Check types
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: {
    status: 'healthy' | 'unhealthy';
    latency?: number;
  };
  external_services: {
    daily?: { status: 'healthy' | 'unhealthy' };
    stripe?: { status: 'healthy' | 'unhealthy' };
    smtp?: { status: 'healthy' | 'unhealthy' };
  };
}

// File Upload types
export interface FileUploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
}
