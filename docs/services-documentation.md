# Services Documentation

This document provides detailed information about the service layer of the Fintan Virtual Care Hub application.

## Table of Contents

1. [Authentication Service](#authentication-service)
2. [Patient Service](#patient-service)
3. [Provider Service](#provider-service)
4. [Appointment Service](#appointment-service)
5. [Consultation Service](#consultation-service)
6. [Daily Service (Audio/Video)](#daily-service)
7. [Medical Record Service](#medical-record-service)
8. [Notification Service](#notification-service)
9. [Payment Service](#payment-service)
10. [Calendar Service](#calendar-service)

---

## Authentication Service

The Authentication Service handles user authentication, registration, and session management.

### Methods

#### `register(userData: RegisterUserData): Promise<AuthResult>`

Registers a new user in the system.

**Parameters:**
- `userData`: Object containing user registration data
  - `email`: User's email address
  - `password`: User's password
  - `name`: User's full name
  - `role`: User's role (PATIENT, PROVIDER, ADMIN)
  - `additionalInfo`: Additional information based on role

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `user`: User object if successful
  - `token`: JWT token if successful
  - `message`: Error message if unsuccessful

#### `login(email: string, password: string): Promise<AuthResult>`

Authenticates a user and creates a session.

**Parameters:**
- `email`: User's email address
- `password`: User's password

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `user`: User object if successful
  - `token`: JWT token if successful
  - `message`: Error message if unsuccessful

#### `resetPassword(email: string): Promise<ResetResult>`

Initiates the password reset process.

**Parameters:**
- `email`: User's email address

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `message`: Success or error message

#### `verifyResetToken(token: string): Promise<VerifyResult>`

Verifies a password reset token.

**Parameters:**
- `token`: Reset token from email

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `message`: Success or error message

#### `updatePassword(token: string, newPassword: string): Promise<UpdateResult>`

Updates a user's password after reset.

**Parameters:**
- `token`: Reset token from email
- `newPassword`: New password

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `message`: Success or error message

---

## Patient Service

The Patient Service handles patient-specific operations.

### Methods

#### `getPatientById(patientId: string): Promise<PatientResult>`

Retrieves a patient by ID.

**Parameters:**
- `patientId`: Patient's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `patient`: Patient object if successful
  - `message`: Error message if unsuccessful

#### `getPatientByUserId(userId: string): Promise<PatientResult>`

Retrieves a patient by user ID.

**Parameters:**
- `userId`: User's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `patient`: Patient object if successful
  - `message`: Error message if unsuccessful

#### `updatePatientProfile(patientId: string, data: PatientUpdateData): Promise<PatientResult>`

Updates a patient's profile information.

**Parameters:**
- `patientId`: Patient's unique identifier
- `data`: Object containing fields to update

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `patient`: Updated patient object if successful
  - `message`: Error message if unsuccessful

#### `getPatientMedicalHistory(patientId: string): Promise<MedicalHistoryResult>`

Retrieves a patient's medical history.

**Parameters:**
- `patientId`: Patient's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `medicalHistory`: Array of medical history records if successful
  - `message`: Error message if unsuccessful

---

## Provider Service

The Provider Service handles provider-specific operations.

### Methods

#### `getProviderById(providerId: string): Promise<ProviderResult>`

Retrieves a provider by ID.

**Parameters:**
- `providerId`: Provider's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `provider`: Provider object if successful
  - `message`: Error message if unsuccessful

#### `getProviderByUserId(userId: string): Promise<ProviderResult>`

Retrieves a provider by user ID.

**Parameters:**
- `userId`: User's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `provider`: Provider object if successful
  - `message`: Error message if unsuccessful

#### `getAllProviders(filters?: ProviderFilters): Promise<ProvidersResult>`

Retrieves all providers, optionally filtered.

**Parameters:**
- `filters`: Optional object containing filter criteria
  - `specialty`: Filter by specialty
  - `availability`: Filter by availability

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `providers`: Array of provider objects if successful
  - `message`: Error message if unsuccessful

#### `updateProviderProfile(providerId: string, data: ProviderUpdateData): Promise<ProviderResult>`

Updates a provider's profile information.

**Parameters:**
- `providerId`: Provider's unique identifier
- `data`: Object containing fields to update

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `provider`: Updated provider object if successful
  - `message`: Error message if unsuccessful

#### `updateProviderAvailability(providerId: string, availability: AvailabilityData[]): Promise<AvailabilityResult>`

Updates a provider's availability schedule.

**Parameters:**
- `providerId`: Provider's unique identifier
- `availability`: Array of availability objects

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `availability`: Updated availability array if successful
  - `message`: Error message if unsuccessful

---

## Appointment Service

The Appointment Service handles appointment scheduling and management.

### Methods

#### `createAppointment(appointmentData: AppointmentCreateData): Promise<AppointmentResult>`

Creates a new appointment.

**Parameters:**
- `appointmentData`: Object containing appointment data
  - `patientId`: Patient's unique identifier
  - `providerId`: Provider's unique identifier
  - `appointmentDate`: Date and time of appointment
  - `consultationType`: Type of consultation (AUDIO, VIDEO)
  - `reason`: Reason for appointment

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `appointment`: Created appointment object if successful
  - `message`: Error message if unsuccessful

#### `getAppointmentById(appointmentId: string): Promise<AppointmentResult>`

Retrieves an appointment by ID.

**Parameters:**
- `appointmentId`: Appointment's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `appointment`: Appointment object if successful
  - `message`: Error message if unsuccessful

#### `getPatientAppointments(patientId: string, status?: AppointmentStatus): Promise<AppointmentsResult>`

Retrieves appointments for a specific patient.

**Parameters:**
- `patientId`: Patient's unique identifier
- `status`: Optional filter by appointment status

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `appointments`: Array of appointment objects if successful
  - `message`: Error message if unsuccessful

#### `getProviderAppointments(providerId: string, status?: AppointmentStatus): Promise<AppointmentsResult>`

Retrieves appointments for a specific provider.

**Parameters:**
- `providerId`: Provider's unique identifier
- `status`: Optional filter by appointment status

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `appointments`: Array of appointment objects if successful
  - `message`: Error message if unsuccessful

#### `updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<AppointmentResult>`

Updates an appointment's status.

**Parameters:**
- `appointmentId`: Appointment's unique identifier
- `status`: New appointment status

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `appointment`: Updated appointment object if successful
  - `message`: Error message if unsuccessful

#### `rescheduleAppointment(appointmentId: string, newDate: Date): Promise<AppointmentResult>`

Reschedules an appointment.

**Parameters:**
- `appointmentId`: Appointment's unique identifier
- `newDate`: New date and time for the appointment

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `appointment`: Updated appointment object if successful
  - `message`: Error message if unsuccessful

---

## Consultation Service

The Consultation Service handles video/audio consultations between patients and providers.

### Methods

#### `getConsultationById(consultationId: string): Promise<ConsultationResult>`

Retrieves a consultation by ID.

**Parameters:**
- `consultationId`: Consultation's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `consultation`: Consultation object if successful
  - `message`: Error message if unsuccessful

#### `getConsultationByAppointmentId(appointmentId: string): Promise<ConsultationResult>`

Retrieves a consultation by appointment ID.

**Parameters:**
- `appointmentId`: Appointment's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `consultation`: Consultation object if successful
  - `message`: Error message if unsuccessful

#### `createConsultationRoom(appointmentId: string): Promise<string>`

Creates a new consultation room using Daily.co API.

**Parameters:**
- `appointmentId`: Appointment's unique identifier

**Returns:**
- Promise resolving to the room URL

#### `generateRoomToken(consultationId: string, userId: string): Promise<string>`

Generates a secure token for joining a consultation room.

**Parameters:**
- `consultationId`: Consultation's unique identifier
- `userId`: User's unique identifier

**Returns:**
- Promise resolving to the room token

#### `createConsultation(appointmentId: string): Promise<ConsultationResult>`

Creates a new consultation for an appointment.

**Parameters:**
- `appointmentId`: Appointment's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `consultation`: Created consultation object if successful
  - `message`: Error message if unsuccessful

#### `updateConsultationStatus(consultationId: string, status: string): Promise<ConsultationResult>`

Updates a consultation's status.

**Parameters:**
- `consultationId`: Consultation's unique identifier
- `status`: New consultation status

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `consultation`: Updated consultation object if successful
  - `message`: Error message if unsuccessful

#### `updateConsultation(consultationId: string, data: any): Promise<ConsultationResult>`

Updates a consultation with provided data.

**Parameters:**
- `consultationId`: Consultation's unique identifier
- `data`: Object containing fields to update

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `consultation`: Updated consultation object if successful
  - `message`: Error message if unsuccessful

---

## Daily Service

The Daily Service handles audio/video call functionality using the Daily.co SDK.

### Methods

#### `initializeCall(roomUrl: string, token: string, options?: CallOptions): Promise<boolean>`

Initializes a call with Daily.co.

**Parameters:**
- `roomUrl`: URL of the Daily.co room
- `token`: Secure token for joining the room
- `options`: Optional call configuration
  - `video`: Boolean to enable/disable video
  - `audio`: Boolean to enable/disable audio

**Returns:**
- Promise resolving to a boolean indicating success

#### `toggleAudio(): Promise<boolean>`

Toggles the local audio on/off.

**Returns:**
- Promise resolving to a boolean indicating success

#### `toggleVideo(): Promise<boolean>`

Toggles the local video on/off.

**Returns:**
- Promise resolving to a boolean indicating success

#### `enableVideo(): Promise<boolean>`

Enables the local video.

**Returns:**
- Promise resolving to a boolean indicating success

#### `shareScreen(): Promise<boolean>`

Toggles screen sharing on/off.

**Returns:**
- Promise resolving to a boolean indicating success

#### `sendVideoRequest(): Promise<boolean>`

Sends a request to enable video (for providers in audio calls).

**Returns:**
- Promise resolving to a boolean indicating success

#### `sendVideoRequestResponse(accepted: boolean): Promise<boolean>`

Sends a response to a video request.

**Parameters:**
- `accepted`: Boolean indicating if the request was accepted

**Returns:**
- Promise resolving to a boolean indicating success

#### `onVideoRequestReceived(callback: () => void): void`

Registers a callback for when a video request is received.

**Parameters:**
- `callback`: Function to call when a video request is received

#### `endCall(): Promise<void>`

Ends the current call and cleans up resources.

**Returns:**
- Promise that resolves when the call has ended

#### `getCallObject(): any`

Gets the Daily.co call object for advanced usage.

**Returns:**
- The Daily.co call object

---

## Medical Record Service

The Medical Record Service handles patient medical records.

### Methods

#### `getPatientRecords(patientId: string): Promise<MedicalRecordsResult>`

Retrieves medical records for a specific patient.

**Parameters:**
- `patientId`: Patient's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `records`: Array of medical record objects if successful
  - `message`: Error message if unsuccessful

#### `getRecordById(recordId: string): Promise<MedicalRecordResult>`

Retrieves a specific medical record by ID.

**Parameters:**
- `recordId`: Medical record's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `record`: Medical record object if successful
  - `message`: Error message if unsuccessful

#### `createRecord(recordData: MedicalRecordCreateData): Promise<MedicalRecordResult>`

Creates a new medical record.

**Parameters:**
- `recordData`: Object containing medical record data
  - `patientId`: Patient's unique identifier
  - `providerId`: Provider's unique identifier
  - `consultationId`: Related consultation ID
  - `diagnosis`: Diagnosis information
  - `notes`: Clinical notes
  - `prescriptions`: Prescribed medications

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `record`: Created medical record object if successful
  - `message`: Error message if unsuccessful

#### `updateRecord(recordId: string, data: MedicalRecordUpdateData): Promise<MedicalRecordResult>`

Updates an existing medical record.

**Parameters:**
- `recordId`: Medical record's unique identifier
- `data`: Object containing fields to update

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `record`: Updated medical record object if successful
  - `message`: Error message if unsuccessful

---

## Notification Service

The Notification Service handles system notifications and reminders.

### Methods

#### `createNotification(notificationData: NotificationCreateData): Promise<NotificationResult>`

Creates a new notification.

**Parameters:**
- `notificationData`: Object containing notification data
  - `userId`: User's unique identifier
  - `type`: Notification type
  - `title`: Notification title
  - `message`: Notification message
  - `relatedId`: ID of related entity (appointment, consultation, etc.)

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `notification`: Created notification object if successful
  - `message`: Error message if unsuccessful

#### `getUserNotifications(userId: string, read?: boolean): Promise<NotificationsResult>`

Retrieves notifications for a specific user.

**Parameters:**
- `userId`: User's unique identifier
- `read`: Optional filter by read status

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `notifications`: Array of notification objects if successful
  - `message`: Error message if unsuccessful

#### `markNotificationAsRead(notificationId: string): Promise<NotificationResult>`

Marks a notification as read.

**Parameters:**
- `notificationId`: Notification's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `notification`: Updated notification object if successful
  - `message`: Error message if unsuccessful

#### `sendAppointmentReminder(appointmentId: string): Promise<ReminderResult>`

Sends a reminder for an upcoming appointment.

**Parameters:**
- `appointmentId`: Appointment's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `message`: Success or error message

---

## Payment Service

The Payment Service handles payment processing and billing.

### Methods

#### `createPaymentIntent(amount: number, currency: string, metadata: any): Promise<PaymentIntentResult>`

Creates a payment intent with Stripe.

**Parameters:**
- `amount`: Payment amount in cents
- `currency`: Currency code (e.g., 'usd')
- `metadata`: Additional metadata for the payment

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `clientSecret`: Client secret for Stripe if successful
  - `message`: Error message if unsuccessful

#### `processPayment(appointmentId: string, paymentMethodId: string): Promise<PaymentResult>`

Processes a payment for an appointment.

**Parameters:**
- `appointmentId`: Appointment's unique identifier
- `paymentMethodId`: Stripe payment method ID

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `payment`: Payment object if successful
  - `message`: Error message if unsuccessful

#### `getPaymentHistory(userId: string): Promise<PaymentsResult>`

Retrieves payment history for a user.

**Parameters:**
- `userId`: User's unique identifier

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `payments`: Array of payment objects if successful
  - `message`: Error message if unsuccessful

#### `refundPayment(paymentId: string, amount?: number): Promise<RefundResult>`

Processes a refund for a payment.

**Parameters:**
- `paymentId`: Payment's unique identifier
- `amount`: Optional refund amount (defaults to full amount)

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `refund`: Refund object if successful
  - `message`: Error message if unsuccessful

---

## Calendar Service

The Calendar Service handles calendar operations and availability management.

### Methods

#### `getProviderAvailability(providerId: string, startDate: Date, endDate: Date): Promise<AvailabilityResult>`

Retrieves a provider's availability within a date range.

**Parameters:**
- `providerId`: Provider's unique identifier
- `startDate`: Start date for availability search
- `endDate`: End date for availability search

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `availability`: Array of available time slots if successful
  - `message`: Error message if unsuccessful

#### `getAvailableTimeSlots(providerId: string, date: Date): Promise<TimeSlotsResult>`

Retrieves available time slots for a specific date.

**Parameters:**
- `providerId`: Provider's unique identifier
- `date`: Date to check availability

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `timeSlots`: Array of available time slots if successful
  - `message`: Error message if unsuccessful

#### `blockTimeSlot(providerId: string, startTime: Date, endTime: Date, reason?: string): Promise<BlockResult>`

Blocks a time slot in a provider's calendar.

**Parameters:**
- `providerId`: Provider's unique identifier
- `startTime`: Start time of the block
- `endTime`: End time of the block
- `reason`: Optional reason for blocking

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `block`: Created block object if successful
  - `message`: Error message if unsuccessful

#### `syncWithExternalCalendar(providerId: string, calendarType: string, calendarId: string): Promise<SyncResult>`

Syncs with an external calendar service.

**Parameters:**
- `providerId`: Provider's unique identifier
- `calendarType`: Type of external calendar (GOOGLE, OUTLOOK, etc.)
- `calendarId`: ID of the external calendar

**Returns:**
- Promise resolving to an object containing:
  - `success`: Boolean indicating success
  - `message`: Success or error message

