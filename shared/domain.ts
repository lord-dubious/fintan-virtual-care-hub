// Shared domain enums generated from Prisma schema
// This file MUST stay in sync with prisma/schema.prisma.
// Both backend (ts-node) and frontend (Vite) import from here to avoid string-drift bugs.

// Define enums directly for shared use (avoiding complex import paths)
export const Role = {
  PATIENT: 'PATIENT',
  PROVIDER: 'PROVIDER',
  DOCTOR: 'DOCTOR',
  ADMIN: 'ADMIN',
} as const;

export const ConsultationType = {
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
} as const;

export const AppointmentStatus = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;

export const PaymentStatus = {
  INITIATED: 'INITIATED',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCEEDED: 'SUCCEEDED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export const PaymentMethod = {
  STRIPE: 'STRIPE',
  PAYSTACK: 'PAYSTACK',
  PAYPAL: 'PAYPAL',
  FLUTTERWAVE: 'FLUTTERWAVE',
} as const;

// Export types
export type Role = typeof Role[keyof typeof Role];
export type ConsultationType = typeof ConsultationType[keyof typeof ConsultationType];
export type AppointmentStatus = typeof AppointmentStatus[keyof typeof AppointmentStatus];
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

// Utility: runtime guard helpers
export const isConsultationType = (v: unknown): v is ConsultationType =>
	v === ConsultationType.VIDEO || v === ConsultationType.AUDIO;

export const isAppointmentStatus = (v: unknown): v is AppointmentStatus =>
	Object.values(AppointmentStatus).includes(v as AppointmentStatus);
