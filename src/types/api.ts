// Comprehensive API type definitions

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'PATIENT' | 'PROVIDER' | 'ADMIN';
  phone?: string;
  profilePicture?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  timezone?: string;
  calcomUserId?: number;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  csrfToken?: string;
}

// Patient Types
export interface Patient {
  id: string;
  userId: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  emergencyContact?: EmergencyContact;
  medicalHistory?: string;
  allergies?: string[];
  medications?: string[];
  metadata?: Record<string, unknown>;
  user?: User;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// Provider Types
export interface Provider {
  id: string;
  userId: string;
  specialization?: string;
  licenseNumber?: string;
  experience?: number;
  consultationFee?: number;
  bio?: string;
  user?: User;
}

// Appointment Types
export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type ConsultationType = 'VIDEO' | 'AUDIO';

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  appointmentDate: string;
  reason?: string;
  duration?: number;
  notes?: string;
  timezone?: string;
  consultationType: ConsultationType;
  status: AppointmentStatus;
  calcomBookingId?: number;
  calcomBookingUid?: string;
  calcomEventTypeId?: number;
  calcomMetadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  provider?: Provider;
  consultation?: Consultation;
  payment?: Payment;
}

// Consultation Types
export interface Consultation {
  id: string;
  appointmentId: string;
  dailyRoomId?: string;
  dailyRoomName?: string;
  roomUrl?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  videoEnabled: boolean;
  startedAt?: string;
  endedAt?: string;
  recordingUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  appointment?: Appointment;
}

// Payment Types
export interface Payment {
  id: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentMethod: 'STRIPE' | 'PAYSTACK' | 'PAYPAL' | 'FLUTTERWAVE';
  transactionId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  patientId: string;
  appointmentId?: string;
  amount: number;
  currency?: string;
  paymentMethod: 'STRIPE' | 'PAYSTACK' | 'PAYPAL' | 'FLUTTERWAVE';
  metadata?: Record<string, unknown>;
}

// Medical Records Types
export interface MedicalRecord {
  id: string;
  patientId: string;
  providerId: string;
  appointmentId?: string;
  title: string;
  content: string;
  type: 'CONSULTATION_NOTES' | 'PRESCRIPTION' | 'LAB_RESULT' | 'DIAGNOSIS' | 'OTHER';
  attachments?: string[];
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  patient?: Patient;
  provider?: Provider;
}

// Dashboard Types
export interface PatientDashboardData {
  upcomingAppointments: Appointment[];
  recentAppointments: Appointment[];
  nextAppointment?: Appointment;
  medicalRecords: MedicalRecord[];
  statistics: {
    totalAppointments: number;
    completedAppointments: number;
    upcomingAppointments: number;
    totalSpent: number;
  };
  recentActivity: ActivityLog[];
  patient?: Patient;
}

export interface ProviderDashboardData {
  todaysAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  pastAppointments: Appointment[];
  recentPatients: Patient[];
  statistics: {
    totalPatients: number;
    todaysAppointments: number;
    upcomingAppointments: number;
    totalEarnings: number;
    completedAppointments: number;
  };
  pendingTasks: Task[];
  provider?: Provider;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'APPOINTMENT_REVIEW' | 'MEDICAL_RECORD' | 'FOLLOW_UP' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate?: string;
  completed: boolean;
  createdAt: string;
}

// Activity Log Types
export interface ActivityLog {
  id: string;
  userId: string;
  category: string;
  action: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Booking Types
export interface TimeSlot {
  time: string;
  available: boolean;
  duration?: number;
}

export interface AvailabilitySlot {
  date: string;
  slots: TimeSlot[];
}

export interface BookingData {
  patientId: string;
  providerId: string;
  appointmentDate: string;
  consultationType: ConsultationType;
  reason?: string;
  duration?: number;
  timezone?: string;
}

// File Upload Types
export interface FileUploadResponse {
  success: boolean;
  data?: {
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    url: string;
  };
  error?: string;
}

// Search and Filter Types
export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface AppointmentFilters {
  status?: AppointmentStatus | string;
  providerId?: string;
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
  consultationType?: ConsultationType;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResponse {
  success: false;
  error: string;
  details: {
    errors: ValidationError[];
  };
}

// Health Check Types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'healthy' | 'unhealthy';
    redis: 'healthy' | 'unhealthy';
    calcom: 'healthy' | 'unhealthy';
  };
  version: string;
}

// Statistics Types
export interface Statistics {
  totalUsers: number;
  totalAppointments: number;
  totalRevenue: number;
  activeUsers: number;
  completionRate: number;
  averageRating: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// Cal.com Integration Types
export interface CalcomEventType {
  id: number;
  title: string;
  slug: string;
  description: string;
  length: number;
  locations: Array<{
    type: string;
    integration?: string;
    metadata?: Record<string, unknown>;
  }>;
  requiresConfirmation: boolean;
  disableGuests: boolean;
}

export interface CalcomBooking {
  id: number;
  uid: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: Array<{
    email: string;
    name: string;
    timeZone: string;
  }>;
  organizer: {
    email: string;
    name: string;
    timeZone: string;
  };
  location: string;
  status: 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';
  metadata: Record<string, unknown>;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
}

export interface CreateBookingRequest {
  eventTypeId: number;
  startTime: string;
  endTime: string;
  consultationType: ConsultationType;
  notes?: string;
}
