// Unified Enum System with Zod Validation
// This file ensures type safety and consistency between frontend and backend

import { z } from 'zod';

// ============================================================================
// USER & AUTHENTICATION ENUMS
// ============================================================================

export const Role = {
  PATIENT: 'PATIENT',
  PROVIDER: 'PROVIDER', 
  DOCTOR: 'DOCTOR', // Alias for PROVIDER for backward compatibility
  ADMIN: 'ADMIN',
} as const;

export type Role = typeof Role[keyof typeof Role];

export const RoleSchema = z.enum(['PATIENT', 'PROVIDER', 'DOCTOR', 'ADMIN']);

// ============================================================================
// APPOINTMENT ENUMS
// ============================================================================

export const AppointmentStatus = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;

export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];

export const AppointmentStatusSchema = z.enum([
  'SCHEDULED',
  'CONFIRMED', 
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW'
]);

export const ConsultationType = {
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  IN_PERSON: 'IN_PERSON', // For future use
} as const;

export type ConsultationType = typeof ConsultationType[keyof typeof ConsultationType];

export const ConsultationTypeSchema = z.enum(['VIDEO', 'AUDIO', 'IN_PERSON']);

// ============================================================================
// PAYMENT ENUMS
// ============================================================================

export const PaymentStatus = {
  INITIATED: 'INITIATED',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCEEDED: 'SUCCEEDED',
  COMPLETED: 'COMPLETED', // Alias for SUCCEEDED
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const PaymentStatusSchema = z.enum([
  'INITIATED',
  'PENDING',
  'PROCESSING', 
  'SUCCEEDED',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'REFUNDED'
]);

export const PaymentMethod = {
  STRIPE: 'STRIPE',
  PAYSTACK: 'PAYSTACK',
  PAYPAL: 'PAYPAL',
  FLUTTERWAVE: 'FLUTTERWAVE',
  CREDIT_CARD: 'CREDIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export const PaymentMethodSchema = z.enum([
  'STRIPE',
  'PAYSTACK',
  'PAYPAL',
  'FLUTTERWAVE',
  'CREDIT_CARD',
  'BANK_TRANSFER'
]);

// ============================================================================
// CONSULTATION ENUMS
// ============================================================================

export const ConsultationStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type ConsultationStatus = typeof ConsultationStatus[keyof typeof ConsultationStatus];

export const ConsultationStatusSchema = z.enum([
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
]);

// ============================================================================
// NOTIFICATION ENUMS
// ============================================================================

export const NotificationType = {
  APPOINTMENT_REMINDER: 'APPOINTMENT_REMINDER',
  APPOINTMENT_CONFIRMED: 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED: 'APPOINTMENT_CANCELLED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  CONSULTATION_READY: 'CONSULTATION_READY',
  SYSTEM_NOTIFICATION: 'SYSTEM_NOTIFICATION',
  PRESCRIPTION_READY: 'PRESCRIPTION_READY',
  TEST_RESULTS: 'TEST_RESULTS',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const NotificationTypeSchema = z.enum([
  'APPOINTMENT_REMINDER',
  'APPOINTMENT_CONFIRMED',
  'APPOINTMENT_CANCELLED',
  'PAYMENT_RECEIVED',
  'CONSULTATION_READY',
  'SYSTEM_NOTIFICATION',
  'PRESCRIPTION_READY',
  'TEST_RESULTS'
]);

// ============================================================================
// ONBOARDING ENUMS
// ============================================================================

export const OnboardingStatus = {
  INCOMPLETE: 'INCOMPLETE',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type OnboardingStatus = typeof OnboardingStatus[keyof typeof OnboardingStatus];

export const OnboardingStatusSchema = z.enum(['INCOMPLETE', 'IN_PROGRESS', 'COMPLETED']);

// ============================================================================
// MEDICAL RECORD ENUMS
// ============================================================================

export const MedicalRecordType = {
  CONSULTATION: 'CONSULTATION',
  PRESCRIPTION: 'PRESCRIPTION',
  LAB_RESULT: 'LAB_RESULT',
  IMAGING: 'IMAGING',
  VACCINATION: 'VACCINATION',
  ALLERGY: 'ALLERGY',
  CONDITION: 'CONDITION',
} as const;

export type MedicalRecordType = typeof MedicalRecordType[keyof typeof MedicalRecordType];

export const MedicalRecordTypeSchema = z.enum([
  'CONSULTATION',
  'PRESCRIPTION',
  'LAB_RESULT',
  'IMAGING',
  'VACCINATION',
  'ALLERGY',
  'CONDITION'
]);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Type guards for runtime validation
export const isRole = (value: unknown): value is Role => {
  return Object.values(Role).includes(value as Role);
};

export const isAppointmentStatus = (value: unknown): value is AppointmentStatus => {
  return Object.values(AppointmentStatus).includes(value as AppointmentStatus);
};

export const isPaymentStatus = (value: unknown): value is PaymentStatus => {
  return Object.values(PaymentStatus).includes(value as PaymentStatus);
};

export const isConsultationType = (value: unknown): value is ConsultationType => {
  return Object.values(ConsultationType).includes(value as ConsultationType);
};

// Validation helpers
export const validateRole = (value: unknown): Role => {
  return RoleSchema.parse(value);
};

export const validateAppointmentStatus = (value: unknown): AppointmentStatus => {
  return AppointmentStatusSchema.parse(value);
};

export const validatePaymentStatus = (value: unknown): PaymentStatus => {
  return PaymentStatusSchema.parse(value);
};

// Enum to array converters for UI components
export const getRoleOptions = () => Object.values(Role);
export const getAppointmentStatusOptions = () => Object.values(AppointmentStatus);
export const getPaymentStatusOptions = () => Object.values(PaymentStatus);
export const getConsultationTypeOptions = () => Object.values(ConsultationType);
export const getNotificationTypeOptions = () => Object.values(NotificationType);

// Status display helpers
export const getStatusColor = (status: AppointmentStatus | PaymentStatus | ConsultationStatus): string => {
  const colorMap: Record<string, string> = {
    // Appointment statuses
    SCHEDULED: 'blue',
    CONFIRMED: 'green',
    IN_PROGRESS: 'yellow',
    COMPLETED: 'green',
    CANCELLED: 'red',
    NO_SHOW: 'gray',
    
    // Payment statuses
    INITIATED: 'blue',
    PENDING: 'yellow',
    PROCESSING: 'yellow',
    SUCCEEDED: 'green',
    FAILED: 'red',
    REFUNDED: 'orange',
  };
  
  return colorMap[status] || 'gray';
};

export const getStatusLabel = (status: AppointmentStatus | PaymentStatus | ConsultationStatus): string => {
  const labelMap: Record<string, string> = {
    // Appointment statuses
    SCHEDULED: 'Scheduled',
    CONFIRMED: 'Confirmed',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NO_SHOW: 'No Show',

    // Payment statuses
    INITIATED: 'Initiated',
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SUCCEEDED: 'Completed',
    FAILED: 'Failed',
    REFUNDED: 'Refunded',
  };

  return labelMap[status] || status;
};
