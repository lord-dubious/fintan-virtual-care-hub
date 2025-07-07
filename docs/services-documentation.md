# Services Documentation

This document provides detailed information about the service layer of the Fintan Virtual Care Hub application. This includes both frontend (`src/lib/services`, `src/services`) and backend (`backend/src/services`) services, outlining their responsibilities and key methods.

## Table of Contents

1. [Frontend Services Overview](#frontend-services-overview)
2. [Backend Services Overview](#backend-services-overview)
3. [Authentication Service (Backend)](#authentication-service-backend)
4. [Patient Service (Backend)](#patient-service-backend)
5. [Provider Service (Backend)](#provider-service-backend)
6. [Appointment Service (Backend)](#appointment-service-backend)
7. [Consultation Service (Backend)](#consultation-service-backend)
8. [Daily Service (Frontend SDK Wrapper)](#daily-service-frontend-sdk-wrapper)
9. [Medical Record Service (Backend)](#medical-record-service-backend)
10. [Notification Service (Backend)](#notification-service-backend)
11. [Payment Service (Backend)](#payment-service-backend)
12. [Calendar Service (Backend)](#calendar-service-backend)
13. [Calendar Integration Service (Frontend)](#calendar-integration-service-frontend)

---

## Frontend Services Overview

These services are primarily responsible for interacting with the backend APIs and managing client-side logic.

*   `src/lib/services/appointmentService.ts`: Handles client-side logic for appointments.
*   `src/lib/services/authProvider.tsx`: Provides authentication context to React components.
*   `src/lib/services/calendarService.ts`: Manages provider availability and time slots (frontend related logic, though interacts with backend).
*   `src/lib/services/consultationService.ts`: Manages consultation data and state on the frontend, interacts with backend for Daily.co rooms/tokens.
*   `src/lib/services/dailyService.ts`: Wraps the Daily.co SDK for direct frontend video/audio call management.
*   `src/lib/services/medicalRecordService.ts`: Handles client-side medical record operations.
*   `src/lib/services/notificationService.ts`: Manages client-side notifications.
*   `src/lib/services/patientProfileService.ts`: Manages patient profile data and onboarding status.
*   `src/lib/services/patientService.ts`: Handles client-side patient-specific operations.
*   `src/lib/services/paymentService.ts`: Manages client-side payment operations.
*   `src/lib/services/providerService.ts`: Handles client-side provider-specific operations.
*   `src/services/calendarIntegrationService.ts`: Integrates with external calendar services (Google, Outlook, ICS).
*   `src/services/videoCallService.ts`: Manages the overall video call session on the frontend, coordinating with `webrtcService`.
*   `src/services/webrtcService.ts`: Provides a generic WebRTC interface for video/audio calls, used by `videoCallService`.

## Backend Services Overview

These services (`backend/src/services`) primarily interact with the database (Prisma) and external APIs, handling business logic and data persistence.

*   `backend/src/services/authService.ts`: Handles user authentication, token management, and password resets.
*   `backend/src/services/appointmentService.ts`: Manages appointment creation, updates, and retrieval.
*   `backend/src/services/consultationService.ts`: Manages consultation records and Daily.co room/token generation.
*   `backend/src/services/emailService.ts`: Handles sending emails (e.g., password reset, welcome).
*   `backend/src/services/medicalRecordService.ts`: Manages medical record creation, retrieval, and updates.
*   `backend/src/services/notificationService.ts`: Manages server-side notification creation and delivery.
*   `backend/src/services/paymentService.ts`: Handles payment processing and integration with payment gateways.
*   `backend/src/services/patientService.ts`: Manages patient data and onboarding.
*   `backend/src/services/providerService.ts`: Manages provider data and availability.
*   `backend/src/services/dailyService.ts`: (Not a direct file, but conceptually, the `dailyClient` in `backend/src/config/daily.ts` acts as a service for Daily.co API interactions).

---

## Authentication Service (Backend)
**File:** `backend/src/controllers/authController.ts` and underlying services/utils.

The Authentication Service handles user authentication, registration, session management, and password resets.

### Methods

#### `register(req: Request, res: Response): Promise<void>` (POST /api/auth/register)
Registers a new user in the system.

#### `login(req: Request, res: Response): Promise<void>` (POST /api/auth/login)
Authenticates a user and creates a session, setting HTTP-only cookies for access and refresh tokens, and a CSRF token.

#### `logout(req: AuthenticatedRequest, res: Response): Promise<void>` (POST /api/auth/logout)
Logs out a user by clearing cookies and invalidating refresh tokens.

#### `getProfile(req: AuthenticatedRequest, res: Response): Promise<void>` (GET /api/auth/me)
Retrieves the authenticated user's profile.

#### `forgotPassword(req: Request, res: Response): Promise<void>` (POST /api/auth/forgot-password)
Initiates the password reset process by sending a reset link to the user's email.

#### `resetPassword(req: Request, res: Response): Promise<void>` (POST /api/auth/reset-password)
Resets a user's password using a token. This endpoint verifies the token and updates the password in a single step.

#### `refreshToken(req: Request, res: Response): Promise<void>` (POST /api/auth/refresh-token)
Generates a new access token using a refresh token.

#### `setCookies(req: AuthenticatedRequest, res: Response): Promise<void>` (POST /api/auth/set-cookies)
Explicitly sets authentication cookies (used in social auth flow).

#### `getCSRFToken(req: Request, res: Response): Promise<void>` (GET /api/auth/csrf-token)
Generates and provides a CSRF token.

---

## Patient Service (Backend)
**File:** `backend/src/controllers/patientController.ts` and underlying services.

The Patient Service handles patient-specific operations, including profile management and medical history.

### Methods (Conceptual, based on API endpoints)

#### `getPatient(patientId: string): Promise<Patient>` (GET /api/patients/:id)
Retrieves a patient by ID.

#### `updatePatient(patientId: string, data: PatientUpdateData): Promise<Patient>` (PUT /api/patients/:id)
Updates a patient's profile information.

#### `getPatientMedicalHistory(patientId: string): Promise<MedicalRecord[]>` (GET /api/patients/:id/medical-history)
Retrieves a patient's medical history.

---

## Provider Service (Backend)
**File:** `backend/src/controllers/providerController.ts` and underlying services.

The Provider Service handles provider-specific operations, including profile and availability management.

### Methods (Conceptual, based on API endpoints)

#### `getProvider(providerId: string): Promise<Provider>` (GET /api/providers/:id)
Retrieves a provider by ID.

#### `getAllProviders(filters?: ProviderFilters): Promise<Provider[]>` (GET /api/providers)
Retrieves all providers, optionally filtered.

#### `updateProvider(providerId: string, data: ProviderUpdateData): Promise<Provider>` (PUT /api/providers/:id/profile)
Updates a provider's profile information.

#### `updateProviderAvailability(providerId: string, availabilityData: AvailabilityData[]): Promise<Availability[]>` (PUT /api/providers/:id/availability)
Updates a provider's availability schedule.

---

## Appointment Service (Backend)
**File:** `backend/src/controllers/appointmentController.ts` and underlying services.

The Appointment Service handles appointment scheduling and management.

### Methods (Conceptual, based on API endpoints)

#### `createAppointment(appointmentData: AppointmentCreateData): Promise<Appointment>` (POST /api/appointments)
Creates a new appointment.

#### `getAppointment(appointmentId: string): Promise<Appointment>` (GET /api/appointments/:id)
Retrieves an appointment by ID.

#### `getPatientAppointments(patientId: string, status?: AppointmentStatus): Promise<Appointment[]>` (GET /api/appointments/patient/:patientId)
Retrieves appointments for a specific patient.

#### `getProviderAppointments(providerId: string, status?: AppointmentStatus): Promise<Appointment[]>` (GET /api/appointments/provider/:providerId)
Retrieves appointments for a specific provider.

#### `updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<Appointment>` (PUT /api/appointments/:id/status)
Updates an appointment's status.

#### `rescheduleAppointment(appointmentId: string, newDate: Date): Promise<Appointment>` (PUT /api/appointments/:id/reschedule)
Reschedules an appointment.

---

## Consultation Service (Backend)
**File:** `backend/src/controllers/consultationController.ts` and underlying services.

The Consultation Service handles video/audio consultations and Daily.co room/token management.

### Methods

#### `getConsultation(consultationId: string): Promise<Consultation>` (GET /api/consultations/:id)
Retrieves a consultation by ID.

#### `getConsultationByAppointment(appointmentId: string): Promise<Consultation>` (GET /api/consultations/appointment/:appointmentId)
Retrieves a consultation by appointment ID.

#### `joinConsultation(appointmentId: string): Promise<JoinConsultationResponse>` (POST /api/consultations/:appointmentId/join)
Creates a new consultation room if one does not exist for the given appointment, and generates a secure token for the user to join the Daily.co video call.

#### `createConsultation(appointmentId: string, videoEnabled?: boolean): Promise<Consultation>` (POST /api/consultations/create/:appointmentId)
Creates a new consultation record for an appointment.

#### `updateConsultationNotes(consultationId: string, notes: string): Promise<Consultation>` (PUT /api/consultations/:consultationId/notes)
Updates a consultation's notes.

#### `updateConsultationStatus(consultationId: string, status: ConsultationStatus): Promise<Consultation>` (PUT /api/consultations/:consultationId/status)
Updates a consultation's status.

#### `updateConsultation(consultationId: string, data: any): Promise<Consultation>` (PUT /api/consultations/:consultationId)
Updates a consultation with provided data.

---

## Daily Service (Frontend SDK Wrapper)
**File:** `src/lib/services/dailyService.ts`

This service wraps the Daily.co SDK for direct frontend video/audio call management. It is responsible for initializing and controlling the Daily.co call object.

### Methods

#### `initializeCall(roomUrl: string, token?: string, options?: { video?: boolean, audio?: boolean }): Promise<boolean>`
Initializes a call with Daily.co.

#### `toggleAudio(): Promise<boolean>`
Toggles the local audio on/off.

#### `toggleVideo(): Promise<boolean>`
Toggles the local video on/off.

#### `enableVideo(): Promise<boolean>`
Enables the local video.

#### `shareScreen(): Promise<boolean>`
Toggles screen sharing on/off.

#### `sendVideoRequest(): Promise<boolean>`
Sends a request to enable video (for providers in audio calls).

#### `sendVideoRequestResponse(accepted: boolean): Promise<boolean>`
Sends a response to a video request.

#### `onVideoRequestReceived(callback: () => void): void`
Registers a callback for when a video request is received.

#### `endCall(): Promise<void>`
Ends the current call and cleans up resources.

#### `destroyCall(): void`
Destroys the Daily.co call object.

#### `getCallObject(): DailyCall | null`
Gets the Daily.co call object for advanced usage.

#### `getParticipants(): Record<string, ParticipantState>`
Gets the current participants' states in the call.

---

## Medical Record Service (Backend)
**File:** `backend/src/controllers/medicalRecordController.ts` and underlying services.

The Medical Record Service handles patient medical records.

### Methods (Conceptual, based on API endpoints)

#### `getPatientRecords(patientId: string): Promise<MedicalRecord[]>` (GET /api/medical-records/patient/:patientId)
Retrieves medical records for a specific patient.

#### `getRecordById(recordId: string): Promise<MedicalRecord>` (GET /api/medical-records/:id)
Retrieves a specific medical record by ID.

#### `createRecord(recordData: MedicalRecordCreateData): Promise<MedicalRecord>` (POST /api/medical-records)
Creates a new medical record.

#### `updateRecord(recordId: string, data: MedicalRecordUpdateData): Promise<MedicalRecord>` (PUT /api/medical-records/:id)
Updates an existing medical record.

---

## Notification Service (Backend)
**File:** `backend/src/controllers/notificationController.ts` and underlying services.

The Notification Service handles system notifications and reminders.

### Methods (Conceptual, based on API endpoints)

#### `createNotification(notificationData: NotificationCreateData): Promise<Notification>` (POST /api/notifications)
Creates a new notification.

#### `getUserNotifications(userId: string, read?: boolean): Promise<Notification[]>` (GET /api/notifications/user/:userId)
Retrieves notifications for a specific user.

#### `markNotificationAsRead(notificationId: string): Promise<Notification>` (PUT /api/notifications/:id/read)
Marks a notification as read.

---

## Payment Service (Backend)
**File:** `backend/src/controllers/paymentController.ts` and underlying services.

The Payment Service handles payment processing and billing.

### Methods (Conceptual, based on API endpoints)

#### `createPaymentIntent(data: CreatePaymentIntentData): Promise<PaymentIntent>` (POST /api/payments/create-intent)
Creates a payment intent with the integrated payment gateway (e.g., Stripe).

#### `confirmPayment(data: ConfirmPaymentData): Promise<Payment>` (POST /api/payments/confirm)
Confirms a payment for an appointment.

#### `getPaymentHistory(userId: string): Promise<Payment[]>` (GET /api/payments/patient/:patientId or /api/payments/provider/:providerId)
Retrieves payment history for a user (patient or provider).

#### `refundPayment(data: RefundData): Promise<Payment>` (POST /api/payments/refund)
Processes a refund for a payment.

---

## Calendar Service (Backend)
**File:** `backend/src/controllers/calendarController.ts` and underlying services.

The Calendar Service handles provider availability and time slot management.

### Methods (Conceptual, based on API endpoints)

#### `getAvailability(request: AvailabilityRequest): Promise<DayAvailability[]>` (GET /api/calendar/availability)
Retrieves a provider's availability within a date range.

#### `getDayAvailability(providerId: string, date: Date): Promise<DayAvailability>` (GET /api/calendar/availability/:providerId/:date)
Retrieves available time slots for a specific date.

#### `blockTimeSlot(request: BlockTimeSlotRequest): Promise<CalendarEvent>` (POST /api/calendar/block-slot)
Blocks a time slot in a provider's calendar.

---

## Calendar Integration Service (Frontend)
**File:** `src/services/calendarService.ts`

This service handles integration with external calendar services like Google Calendar, Outlook, and ICS.

### Methods

#### `createCalendarEvent(event: CalendarEvent, provider: CalendarProvider): Promise<string | null>`
Creates a calendar event in the specified external calendar.

#### `syncWithCalendar(appointmentId: string, appointmentData: AppointmentWithDetails): Promise<boolean>`
Syncs an appointment with an external calendar, generating an event based on appointment details.
