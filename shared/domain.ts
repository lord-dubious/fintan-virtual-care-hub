// Shared domain types and enums generated from Prisma schema
// This file MUST stay in sync with prisma/schema.prisma.
// Both backend (ts-node) and frontend (Vite) import from here to avoid string-drift bugs.

// ============================================================================
// ENUMS - Aligned with Prisma Schema
// ============================================================================

/** User roles in the healthcare system */
export const Role = {
  PATIENT: 'PATIENT',
  PROVIDER: 'PROVIDER',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
} as const;

/** Types of consultation delivery methods */
export const ConsultationType = {
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
} as const;

/** Appointment lifecycle states */
export const AppointmentStatus = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;

/** Consultation session states */
export const ConsultationStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

/** Payment processing states */
export const PaymentStatus = {
  INITIATED: 'INITIATED',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCEEDED: 'SUCCEEDED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

/** Supported payment providers and methods */
export const PaymentMethod = {
  STRIPE: 'STRIPE',
  PAYSTACK: 'PAYSTACK',
  PAYPAL: 'PAYPAL',
  FLUTTERWAVE: 'FLUTTERWAVE',
  CREDIT_CARD: 'CREDIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
} as const;

// Export enum types
export type Role = typeof Role[keyof typeof Role];
export type ConsultationType = typeof ConsultationType[keyof typeof ConsultationType];
export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];
export type ConsultationStatus = typeof ConsultationStatus[keyof typeof ConsultationStatus];
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

// ============================================================================
// CORE DOMAIN INTERFACES - Aligned with Prisma Models
// ============================================================================

/** Base user entity with authentication and profile data */
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  password: string | null;
  role: Role;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** OAuth account linking for social authentication */
export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

/** User session for authentication state */
export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

/** Patient-specific profile information */
export interface Patient {
  id: string;
  userId: string;
  dateOfBirth: Date | null;
  address: string | null;
  phone: string | null;
  emergencyContact: any | null; // JSON field
  medicalHistory: any | null; // JSON field
  insurance: any | null; // JSON field
  preferences: any | null; // JSON field
  onboardingStatus: string; // INCOMPLETE, IN_PROGRESS, COMPLETED
  onboardingStep: number;
  consentGiven: boolean;
  consentDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Healthcare provider profile information */
export interface Provider {
  id: string;
  userId: string;
  specialization: string | null;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Scheduled healthcare appointment */
export interface Appointment {
  id: string;
  providerId: string;
  patientId: string;
  appointmentDate: Date;
  reason: string | null;
  status: AppointmentStatus;
  consultationType: ConsultationType;
  createdAt: Date;
  updatedAt: Date;
}

/** Live consultation session details */
export interface Consultation {
  id: string;
  appointmentId: string;
  sessionId: string | null;
  roomUrl: string;
  status: ConsultationStatus;
  videoEnabled: boolean;
  notes: string | null;
  startTime: Date | null;
  endTime: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Payment transaction for appointments */
export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  provider: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  reference: string | null;
  transactionId: string | null;
  receiptUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** System notification for users */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  userId: string;
  relatedId: string | null;
  isRead: boolean;
  link: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Medical record for patient health history */
export interface MedicalRecord {
  id: string;
  patientId: string;
  providerId: string;
  consultationId: string | null;
  diagnosis: string | null;
  notes: string | null;
  prescriptions: any | null; // JSON field
  attachments: any | null; // JSON field
  createdAt: Date;
  updatedAt: Date;
}

/** Provider availability schedule */
export interface Availability {
  id: string;
  providerId: string;
  dayOfWeek: string; // MONDAY, TUESDAY, etc.
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// EXTENDED INTERFACES WITH RELATIONS
// ============================================================================

/** User with patient profile attached */
export interface UserWithPatient extends User {
  patient: Patient | null;
}

/** User with provider profile attached */
export interface UserWithProvider extends User {
  provider: Provider | null;
}

/** Patient with user information */
export interface PatientWithUser extends Patient {
  user: User;
}

/** Provider with user information */
export interface ProviderWithUser extends Provider {
  user: User;
}

/** Appointment with full provider and patient details */
export interface AppointmentWithDetails extends Appointment {
  provider: ProviderWithUser;
  patient: PatientWithUser;
  consultation: Consultation | null;
  payment: Payment | null;
}

/** Consultation with appointment details */
export interface ConsultationWithAppointment extends Consultation {
  appointment: AppointmentWithDetails;
}

/** Payment with appointment details */
export interface PaymentWithAppointment extends Payment {
  appointment: AppointmentWithDetails;
}

// ============================================================================
// API REQUEST/RESPONSE DTOS
// ============================================================================

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/** Paginated API response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** User registration request */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: Role;
  phone?: string;
}

/** User login request */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Password reset request */
export interface ResetPasswordRequest {
  email: string;
}

/** Password update request */
export interface UpdatePasswordRequest {
  token: string;
  newPassword: string;
}

/** Create appointment request */
export interface CreateAppointmentRequest {
  providerId: string;
  patientId: string;
  appointmentDate: Date;
  reason?: string;
  consultationType: ConsultationType;
}

/** Update appointment request */
export interface UpdateAppointmentRequest {
  appointmentDate?: Date;
  reason?: string;
  status?: AppointmentStatus;
  consultationType?: ConsultationType;
}

/** Create payment request */
export interface CreatePaymentRequest {
  appointmentId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
}

/** Update patient profile request */
export interface UpdatePatientRequest {
  dateOfBirth?: Date;
  address?: string;
  phone?: string;
  emergencyContact?: any;
  medicalHistory?: any;
  insurance?: any;
  preferences?: any;
  onboardingStatus?: string;
  onboardingStep?: number;
  consentGiven?: boolean;
  consentDate?: Date;
}

/** Update provider profile request */
export interface UpdateProviderRequest {
  specialization?: string;
  bio?: string;
  avatarUrl?: string;
}

/** Create notification request */
export interface CreateNotificationRequest {
  title: string;
  message: string;
  type: string;
  userId: string;
  relatedId?: string;
  link?: string;
}

/** Login credentials */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** User authentication data */
export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

/** Authentication response */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  csrfToken?: string;
}

/** User data type */
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  image?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

/** Notification data */
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  userId: string;
  relatedId?: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Notification types */
export const NotificationType = {
  APPOINTMENT: 'APPOINTMENT',
  APPOINTMENT_CREATED: 'APPOINTMENT_CREATED',
  APPOINTMENT_REMINDER: 'APPOINTMENT_REMINDER',
  CONSULTATION_STARTED: 'CONSULTATION_STARTED',
  PAYMENT: 'PAYMENT',
  REMINDER: 'REMINDER',
  SYSTEM: 'SYSTEM',
  MESSAGE: 'MESSAGE',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

/** Create appointment data */
export interface CreateAppointmentData {
  providerId: string;
  patientId: string;
  appointmentDate: Date;
  reason?: string;
  consultationType: ConsultationType;
}

/** Appointment stats */
export interface AppointmentStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  inProgress: number;
}

/** API appointment interface */
export interface ApiAppointment extends Appointment {
  appointmentDate: Date;
}

/** UI appointment interface */
export interface AppointmentUI {
  id: string;
  patientName: string;
  providerName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: ConsultationType;
}

/** Patient appointment interface */
export interface PatientAppointment {
  id: string;
  appointmentDate: Date;
  status: AppointmentStatus;
  provider: {
    id: string;
    user: {
      name: string;
    };
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Form data for appointment booking */
export interface AppointmentFormData {
  providerId: string;
  appointmentDate: string; // ISO string for form handling
  reason: string;
  consultationType: ConsultationType;
}

/** Form data for patient registration */
export interface PatientRegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string; // ISO string for form handling
}

/** Form data for provider registration */
export interface ProviderRegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  specialization: string;
  bio: string;
  phone: string;
}

/** Filters for appointment queries */
export interface AppointmentFilters {
  status?: AppointmentStatus | AppointmentStatus[];
  consultationType?: ConsultationType;
  providerId?: string;
  patientId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

/** Filters for payment queries */
export interface PaymentFilters {
  status?: PaymentStatus | PaymentStatus[];
  paymentMethod?: PaymentMethod | PaymentMethod[];
  amountMin?: number;
  amountMax?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

/** Filters for patient queries */
export interface PatientFilters {
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  [key: string]: unknown;
}

/** Pagination parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Search parameters */
export interface SearchParams {
  query?: string;
  filters?: Record<string, unknown>;
}

// ============================================================================
// RUNTIME TYPE GUARDS
// ============================================================================

/** Type guard for ConsultationType */
export const isConsultationType = (v: unknown): v is ConsultationType =>
  v === ConsultationType.VIDEO || v === ConsultationType.AUDIO;

/** Type guard for AppointmentStatus */
export const isAppointmentStatus = (v: unknown): v is AppointmentStatus =>
  Object.values(AppointmentStatus).includes(v as AppointmentStatus);

/** Type guard for PaymentStatus */
export const isPaymentStatus = (v: unknown): v is PaymentStatus =>
  Object.values(PaymentStatus).includes(v as PaymentStatus);

/** Type guard for PaymentMethod */
export const isPaymentMethod = (v: unknown): v is PaymentMethod =>
  Object.values(PaymentMethod).includes(v as PaymentMethod);

/** Type guard for Role */
export const isRole = (v: unknown): v is Role =>
  Object.values(Role).includes(v as Role);

/** Type guard for ConsultationStatus */
export const isConsultationStatus = (v: unknown): v is ConsultationStatus =>
  Object.values(ConsultationStatus).includes(v as ConsultationStatus);

// ============================================================================
// HELPER TYPES
// ============================================================================

/** Extract keys from an object type */
export type KeysOf<T> = keyof T;

/** Make specific properties optional */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/** Make specific properties required */
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Create input type by omitting auto-generated fields */
export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/** Create update type by making all fields optional except ID */
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
