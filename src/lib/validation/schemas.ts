// Comprehensive Zod Validation Schemas
// Ensures type safety and data validation across the application

import { z } from 'zod';
import {
  RoleSchema,
  AppointmentStatusSchema,
  ConsultationTypeSchema,
  PaymentStatusSchema,
  PaymentMethodSchema,
  ConsultationStatusSchema,
  NotificationTypeSchema,
  OnboardingStatusSchema,
  MedicalRecordTypeSchema,
} from '@/lib/types/enums';

// ============================================================================
// USER & AUTHENTICATION SCHEMAS
// ============================================================================

export const UserSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  role: RoleSchema,
  phone: z.string().optional(),
  image: z.string().url().optional(),
  profilePicture: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  role: RoleSchema.optional().default('PATIENT'),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const PasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const PasswordUpdateSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ============================================================================
// APPOINTMENT SCHEMAS
// ============================================================================

export const AppointmentSchema = z.object({
  id: z.string().cuid(),
  providerId: z.string().cuid(),
  patientId: z.string().cuid(),
  appointmentDate: z.string().datetime(),
  duration: z.number().min(15).max(180).default(30),
  reason: z.string().max(500).optional(),
  status: AppointmentStatusSchema,
  consultationType: ConsultationTypeSchema,
  notes: z.string().max(1000).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateAppointmentSchema = z.object({
  providerId: z.string().cuid('Invalid provider ID'),
  patientId: z.string().cuid('Invalid patient ID'),
  appointmentDate: z.string().datetime('Invalid appointment date'),
  duration: z.number().min(15, 'Minimum duration is 15 minutes').max(180, 'Maximum duration is 3 hours').default(30),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
  consultationType: ConsultationTypeSchema,
});

export const UpdateAppointmentSchema = z.object({
  appointmentDate: z.string().datetime().optional(),
  duration: z.number().min(15).max(180).optional(),
  reason: z.string().max(500).optional(),
  status: AppointmentStatusSchema.optional(),
  consultationType: ConsultationTypeSchema.optional(),
  notes: z.string().max(1000).optional(),
});

export const AppointmentFiltersSchema = z.object({
  status: AppointmentStatusSchema.optional(),
  consultationType: ConsultationTypeSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  providerId: z.string().cuid().optional(),
  patientId: z.string().cuid().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

export const PaymentSchema = z.object({
  id: z.string().cuid(),
  appointmentId: z.string().cuid(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  status: PaymentStatusSchema,
  provider: PaymentMethodSchema,
  reference: z.string().optional(),
  receiptUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreatePaymentSchema = z.object({
  appointmentId: z.string().cuid('Invalid appointment ID'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  paymentMethod: PaymentMethodSchema,
  metadata: z.record(z.unknown()).optional(),
});

export const PaymentIntentSchema = z.object({
  appointmentId: z.string().cuid('Invalid appointment ID'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3).default('USD'),
  paymentMethod: PaymentMethodSchema,
});

export const PaymentConfirmationSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  paymentMethodId: z.string().optional(),
});

// ============================================================================
// PATIENT SCHEMAS
// ============================================================================

export const PatientSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().datetime().optional(),
  phone: z.string().optional(),
  address: z.string().max(200).optional(),
  emergencyContact: z.object({
    name: z.string().min(1).max(100),
    phone: z.string().min(1),
    relationship: z.string().min(1).max(50),
  }).optional(),
  medicalHistory: z.string().max(2000).optional(),
  allergies: z.array(z.string().max(100)).optional(),
  medications: z.array(z.string().max(100)).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UpdatePatientSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  dateOfBirth: z.string().datetime().optional(),
  phone: z.string().optional(),
  address: z.string().max(200).optional(),
  emergencyContact: z.object({
    name: z.string().min(1).max(100),
    phone: z.string().min(1),
    relationship: z.string().min(1).max(50),
  }).optional(),
  medicalHistory: z.string().max(2000).optional(),
  allergies: z.array(z.string().max(100)).optional(),
  medications: z.array(z.string().max(100)).optional(),
});

// ============================================================================
// CONSULTATION SCHEMAS
// ============================================================================

export const ConsultationSchema = z.object({
  id: z.string().cuid(),
  appointmentId: z.string().cuid(),
  roomUrl: z.string().url(),
  status: ConsultationStatusSchema,
  videoEnabled: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateConsultationSchema = z.object({
  appointmentId: z.string().cuid('Invalid appointment ID'),
  roomUrl: z.string().url('Invalid room URL'),
  videoEnabled: z.boolean().default(false),
});

export const UpdateConsultationSchema = z.object({
  status: ConsultationStatusSchema.optional(),
  videoEnabled: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
});

// ============================================================================
// NOTIFICATION SCHEMAS
// ============================================================================

export const NotificationSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  type: NotificationTypeSchema,
  userId: z.string().cuid(),
  relatedId: z.string().optional(),
  link: z.string().url().optional(),
  isRead: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CreateNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  message: z.string().min(1, 'Message is required').max(500),
  type: NotificationTypeSchema,
  userId: z.string().cuid('Invalid user ID'),
  relatedId: z.string().optional(),
  link: z.string().url().optional(),
});

// ============================================================================
// PAGINATION & FILTERING SCHEMAS
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const SearchSchema = z.object({
  query: z.string().min(1).max(100),
  ...PaginationSchema.shape,
});

export const DateRangeSchema = z.object({
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
}).refine((data) => {
  if (data.dateFrom && data.dateTo) {
    return new Date(data.dateFrom) <= new Date(data.dateTo);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["dateTo"],
});

// ============================================================================
// API RESPONSE SCHEMAS
// ============================================================================

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
    meta: z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      total: z.number().optional(),
      totalPages: z.number().optional(),
    }).optional(),
  });

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  ApiResponseSchema(z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }));

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type User = z.infer<typeof UserSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type RegisterData = z.infer<typeof RegisterSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type CreateAppointmentData = z.infer<typeof CreateAppointmentSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type CreatePaymentData = z.infer<typeof CreatePaymentSchema>;
export type Patient = z.infer<typeof PatientSchema>;
export type Consultation = z.infer<typeof ConsultationSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type ApiResponse<T> = z.infer<ReturnType<typeof ApiResponseSchema<z.ZodType<T>>>>;
export type PaginatedResponse<T> = z.infer<ReturnType<typeof PaginatedResponseSchema<z.ZodType<T>>>>;
