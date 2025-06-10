
// Mock Prisma types until schema is properly generated
export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  password: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  userId: string;
  user?: User;
  dateOfBirth?: Date | null;
  phone?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  medicalHistory?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Provider {
  id: string;
  userId: string;
  user?: User;
  specialization?: string | null;
  licenseNumber?: string | null;
  bio?: string | null;
  experience?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Consultation {
  id: string;
  patientId: string;
  providerId: string;
  status: ConsultationStatus;
  scheduledAt: Date;
  duration?: number | null;
  notes?: string | null;
  prescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  consultationId?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  notes?: string | null;
  attachments?: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  consultationId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  PROVIDER = 'PROVIDER',
  PATIENT = 'PATIENT'
}

export enum ConsultationStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PAYPAL = 'PAYPAL',
  BANK_TRANSFER = 'BANK_TRANSFER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}
