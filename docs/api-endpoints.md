# API Endpoints Documentation

This document provides detailed information about the API endpoints available in the Fintan Virtual Care Hub application.

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication Endpoints

### `/api/auth/register`

Register a new user in the system.

- **Method**: POST
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe",
    "role": "PATIENT",
    "additionalInfo": {
      // Role-specific information
    }
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "PATIENT"
    },
    "token": "jwt-token"
  }
  ```

### `/api/auth/login`

Authenticate a user and create a session.

- **Method**: POST
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "PATIENT"
    },
    "token": "jwt-token"
  }
  ```

### `/api/auth/forgot-password`

Initiate the password reset process.

- **Method**: POST
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "If an account with that email exists, a password reset link has been sent."
  }
  ```

### `/api/auth/reset-password`

Reset a user's password using a token. This endpoint verifies the token and updates the password in a single step.

- **Method**: POST
- **Request Body**:
  ```json
  {
    "token": "reset-token",
    "password": "newSecurePassword123"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "message": "Password has been reset successfully"
  }
  ```

## Patient Endpoints

### `/api/patients/:id`

Get a patient by ID.

- **Method**: GET
- **URL Parameters**: `id` - Patient's unique identifier
- **Response**: 
  ```json
  {
    "success": true,
    "patient": {
      "id": "uuid",
      "userId": "uuid",
      "medicalHistory": {},
      "insurance": {},
      "dateOfBirth": "1990-01-01",
      "address": "123 Main St",
      "phone": "555-123-4567"
    }
  }
  ```

### `/api/patients/user/:userId`

Get a patient by user ID.

- **Method**: GET
- **URL Parameters**: `userId` - User's unique identifier
- **Response**: Same as `/api/patients/:id`

### `/api/patients/:id/profile`

Update a patient's profile information.

- **Method**: PUT
- **URL Parameters**: `id` - Patient's unique identifier
- **Request Body**:
  ```json
  {
    "medicalHistory": {},
    "insurance": {},
    "dateOfBirth": "1990-01-01",
    "address": "123 Main St",
    "phone": "555-123-4567"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "patient": {
      "id": "uuid",
      "userId": "uuid",
      "medicalHistory": {},
      "insurance": {},
      "dateOfBirth": "1990-01-01",
      "address": "123 Main St",
      "phone": "555-123-4567"
    }
  }
  ```

### `/api/patients/:id/medical-history`

Get a patient's medical history.

- **Method**: GET
- **URL Parameters**: `id` - Patient's unique identifier
- **Response**: 
  ```json
  {
    "success": true,
    "medicalHistory": [
      {
        "id": "uuid",
        "patientId": "uuid",
        "providerId": "uuid",
        "diagnosis": "Diagnosis",
        "notes": "Notes",
        "date": "2023-01-01"
      }
    ]
  }
  ```

## Provider Endpoints

### `/api/providers/:id`

Get a provider by ID.

- **Method**: GET
- **URL Parameters**: `id` - Provider's unique identifier
- **Response**: 
  ```json
  {
    "success": true,
    "provider": {
      "id": "uuid",
      "userId": "uuid",
      "specialty": "Cardiology",
      "education": {},
      "experience": {},
      "bio": "Provider bio",
      "availability": []
    }
  }
  ```

### `/api/providers/user/:userId`

Get a provider by user ID.

- **Method**: GET
- **URL Parameters**: `userId` - User's unique identifier
- **Response**: Same as `/api/providers/:id`

### `/api/providers`

Get all providers, optionally filtered.

- **Method**: GET
- **Query Parameters**: 
  - `specialty` - Filter by specialty
  - `availability` - Filter by availability
- **Response**: 
  ```json
  {
    "success": true,
    "providers": [
      {
        "id": "uuid",
        "userId": "uuid",
        "specialty": "Cardiology",
        "education": {},
        "experience": {},
        "bio": "Provider bio",
        "availability": []
      }
    ]
  }
  ```

### `/api/providers/:id/profile`

Update a provider's profile information.

- **Method**: PUT
- **URL Parameters**: `id` - Provider's unique identifier
- **Request Body**:
  ```json
  {
    "specialty": "Cardiology",
    "education": {},
    "experience": {},
    "bio": "Updated provider bio"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "provider": {
      "id": "uuid",
      "userId": "uuid",
      "specialty": "Cardiology",
      "education": {},
      "experience": {},
      "bio": "Updated provider bio",
      "availability": []
    }
  }
  ```

### `/api/providers/:id/availability`

Update a provider's availability schedule.

- **Method**: PUT
- **URL Parameters**: `id` - Provider's unique identifier
- **Request Body**:
  ```json
  {
    "availability": [
      {
        "dayOfWeek": "MONDAY",
        "startTime": "09:00",
        "endTime": "17:00",
        "isAvailable": true
      }
    ]
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "availability": [
      {
        "id": "uuid",
        "providerId": "uuid",
        "dayOfWeek": "MONDAY",
        "startTime": "09:00",
        "endTime": "17:00",
        "isAvailable": true
      }
    ]
  }
  ```

## Appointment Endpoints

### `/api/appointments`

Create a new appointment.

- **Method**: POST
- **Request Body**:
  ```json
  {
    "patientId": "uuid",
    "providerId": "uuid",
    "appointmentDate": "2023-06-15T14:00:00Z",
    "consultationType": "VIDEO",
    "reason": "Annual checkup"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "appointment": {
      "id": "uuid",
      "patientId": "uuid",
      "providerId": "uuid",
      "date": "2023-06-15T14:00:00Z",
      "status": "SCHEDULED",
      "consultationType": "VIDEO",
      "reason": "Annual checkup",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    }
  }
  ```

### `/api/appointments/:id`

Get an appointment by ID.

- **Method**: GET
- **URL Parameters**: `id` - Appointment's unique identifier
- **Response**: 
  ```json
  {
    "success": true,
    "appointment": {
      "id": "uuid",
      "patientId": "uuid",
      "providerId": "uuid",
      "date": "2023-06-15T14:00:00Z",
      "status": "SCHEDULED",
      "consultationType": "VIDEO",
      "reason": "Annual checkup",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    }
  }
  ```

### `/api/appointments/patient/:patientId`

Get appointments for a specific patient.

- **Method**: GET
- **URL Parameters**: `patientId` - Patient's unique identifier
- **Query Parameters**: `status` - Filter by appointment status
- **Response**: 
  ```json
  {
    "success": true,
    "appointments": [
      {
        "id": "uuid",
        "patientId": "uuid",
        "providerId": "uuid",
        "date": "2023-06-15T14:00:00Z",
        "status": "SCHEDULED",
        "consultationType": "VIDEO",
        "reason": "Annual checkup",
        "createdAt": "2023-06-01T12:00:00Z",
        "updatedAt": "2023-06-01T12:00:00Z"
      }
    ]
  }
  ```

### `/api/appointments/provider/:providerId`

Get appointments for a specific provider.

- **Method**: GET
- **URL Parameters**: `providerId` - Provider's unique identifier
- **Query Parameters**: `status` - Filter by appointment status
- **Response**: Same as `/api/appointments/patient/:patientId`

### `/api/appointments/:id/status`

Update an appointment's status.

- **Method**: PUT
- **URL Parameters**: `id` - Appointment's unique identifier
- **Request Body**:
  ```json
  {
    "status": "COMPLETED"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "appointment": {
      "id": "uuid",
      "patientId": "uuid",
      "providerId": "uuid",
      "date": "2023-06-15T14:00:00Z",
      "status": "COMPLETED",
      "consultationType": "VIDEO",
      "reason": "Annual checkup",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    }
  }
  ```

### `/api/appointments/:id/reschedule`

Reschedule an appointment.

- **Method**: PUT
- **URL Parameters**: `id` - Appointment's unique identifier
- **Request Body**:
  ```json
  {
    "newDate": "2023-06-20T15:00:00Z"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "appointment": {
      "id": "uuid",
      "patientId": "uuid",
      "providerId": "uuid",
      "date": "2023-06-20T15:00:00Z",
      "status": "SCHEDULED",
      "consultationType": "VIDEO",
      "reason": "Annual checkup",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T13:00:00Z"
    }
  }
  ```

## Consultation Endpoints

### `/api/consultations/:id`

Get a consultation by ID.

- **Method**: GET
- **URL Parameters**: `id` - Consultation's unique identifier
- **Response**: 
  ```json
  {
    "success": true,
    "consultation": {
      "id": "uuid",
      "appointmentId": "uuid",
      "roomUrl": "https://daily.co/room/uuid",
      "status": "SCHEDULED",
      "videoEnabled": true,
      "notes": "",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    }
  }
  ```

### `/api/consultations/appointment/:appointmentId`

Get a consultation by appointment ID.

- **Method**: GET
- **URL Parameters**: `appointmentId` - Appointment's unique identifier
- **Response**: Same as `/api/consultations/:id`

### `/api/consultations/:appointmentId/join`

Join a consultation. This endpoint creates a new consultation room if one does not exist for the given appointment, and generates a secure token for the user to join the Daily.co video call.

- **Method**: POST
- **URL Parameters**: `appointmentId` - Appointment's unique identifier
- **Response**: 
  ```json
  {
    "success": true,
    "roomUrl": "https://daily.co/room/uuid",
    "token": "daily-co-token",
    "consultation": {
      "id": "uuid",
      "appointmentId": "uuid",
      "roomUrl": "https://daily.co/room/uuid",
      "status": "IN_PROGRESS",
      "videoEnabled": true,
      "notes": "",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    }
  }
  ```

### `/api/consultations/create/:appointmentId`

Create a new consultation for an appointment.

- **Method**: POST
- **URL Parameters**: `appointmentId` - Appointment's unique identifier
- **Response**: 
  ```json
  {
    "success": true,
    "consultation": {
      "id": "uuid",
      "appointmentId": "uuid",
      "roomUrl": "https://daily.co/room/uuid",
      "status": "SCHEDULED",
      "videoEnabled": true,
      "notes": "",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T12:00:00Z"
    }
  }
  ```

### `/api/consultations/:id/status`

Update a consultation's status.

- **Method**: PUT
- **URL Parameters**: `id` - Consultation's unique identifier
- **Request Body**:
  ```json
  {
    "status": "IN_PROGRESS"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "consultation": {
      "id": "uuid",
      "appointmentId": "uuid",
      "roomUrl": "https://daily.co/room/uuid",
      "status": "IN_PROGRESS",
      "videoEnabled": true,
      "notes": "",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T13:00:00Z"
    }
  }
  ```

### `/api/consultations/:id`

Update a consultation with provided data.

- **Method**: PUT
- **URL Parameters**: `id` - Consultation's unique identifier
- **Request Body**:
  ```json
  {
    "notes": "Patient reported symptoms of...",
    "videoEnabled": true
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "consultation": {
      "id": "uuid",
      "appointmentId": "uuid",
      "roomUrl": "https://daily.co/room/uuid",
      "status": "IN_PROGRESS",
      "videoEnabled": true,
      "notes": "Patient reported symptoms of...",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T13:30:00Z"
    }
  }
  ```

## Medical Record Endpoints

### `/api/medical-records/patient/:patientId`

Get medical records for a specific patient.

- **Method**: GET
- **URL Parameters**: `patientId` - Patient's unique identifier
- **Response**: 
  ```json
  {
    "success": true,
    "records": [
      {
        "id": "uuid",
        "patientId": "uuid",
        "providerId": "uuid",
        "consultationId": "uuid",
        "diagnosis": "Diagnosis",
        "notes": "Clinical notes",
        "prescriptions": [],
        "createdAt": "2023-06-15T15:30:00Z",
        "updatedAt": "2023-06-15T15:30:00Z"
      }
    ]
  }
  ```

### `/api/medical-records/:id`

Get a specific medical record by ID.

- **Method**: GET
- **URL Parameters**: `id` - Medical record's unique identifier
- **Response**: 
  ```json
  {
    "success": true,
    "record": {
      "id": "uuid",
      "patientId": "uuid",
      "providerId": "uuid",
      "consultationId": "uuid",
      "diagnosis": "Diagnosis",
      "notes": "Clinical notes",
      "prescriptions": [],
      "createdAt": "2023-06-15T15:30:00Z",
      "updatedAt": "2023-06-15T15:30:00Z"
    }
  }
  ```

### `/api/medical-records`

Create a new medical record.

- **Method**: POST
- **Request Body**:
  ```json
  {
    "patientId": "uuid",
    "providerId": "uuid",
    "consultationId": "uuid",
    "diagnosis": "Diagnosis",
    "notes": "Clinical notes",
    "prescriptions": []
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "record": {
      "id": "uuid",
      "patientId": "uuid",
      "providerId": "uuid",
      "consultationId": "uuid",
      "diagnosis": "Diagnosis",
      "notes": "Clinical notes",
      "prescriptions": [],
      "createdAt": "2023-06-15T15:30:00Z",
      "updatedAt": "2023-06-15T15:30:00Z"
    }
  }
  ```

### `/api/medical-records/:id`

Update an existing medical record.

- **Method**: PUT
- **URL Parameters**: `id` - Medical record's unique identifier
- **Request Body**:
  ```json
  {
    "diagnosis": "Updated diagnosis",
    "notes": "Updated clinical notes",
    "prescriptions": []
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "record": {
      "id": "uuid",
      "patientId": "uuid",
      "providerId": "uuid",
      "consultationId": "uuid",
      "diagnosis": "Updated diagnosis",
      "notes": "Updated clinical notes",
      "prescriptions": [],
      "createdAt": "2023-06-15T15:30:00Z",
      "updatedAt": "2023-06-15T16:00:00Z"
    }
  }
  ```

## Notification Endpoints

### `/api/notifications`

Create a new notification.

- **Method**: POST
- **Request Body**:
  ```json
  {
    "userId": "uuid",
    "type": "APPOINTMENT_REMINDER",
    "title": "Upcoming Appointment",
    "message": "You have an appointment tomorrow at 2:00 PM",
    "relatedId": "uuid"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "notification": {
      "id": "uuid",
      "userId": "uuid",
      "type": "APPOINTMENT_REMINDER",
      "title": "Upcoming Appointment",
      "message": "You have an appointment tomorrow at 2:00 PM",
      "read": false,
      "relatedId": "uuid",
      "createdAt": "2023-06-14T14:00:00Z"
    }
  }
  ```

### `/api/notifications/user/:userId`

Get notifications for a specific user.

- **Method**: GET
- **URL Parameters**: `userId` - User's unique identifier
- **Query Parameters**: `read` - Filter by read status
- **Response**: 
  ```json
  {
    "success": true,
    "notifications": [
      {
        "id": "uuid",
        "userId": "uuid",
        "type": "APPOINTMENT_REMINDER",
        "title": "Upcoming Appointment",
        "message": "You have an appointment tomorrow at 2:00 PM",
        "read": false,
        "relatedId": "uuid",
        "createdAt": "2023-06-14T14:00:00Z"
      }
    ]
  }
  ```

### `/api/notifications/:id/read`

Mark a notification as read.

- **Method**: PUT
- **URL Parameters**: `id` - Notification's unique identifier
- **Response**: 
  ```json
  {
    "success": true,
    "notification": {
      "id": "uuid",
      "userId": "uuid",
      "type": "APPOINTMENT_REMINDER",
      "title": "Upcoming Appointment",
      "message": "You have an appointment tomorrow at 2:00 PM",
      "read": true,
      "relatedId": "uuid",
      "createdAt": "2023-06-14T14:00:00Z"
    }
  }
  ```

## Payment Endpoints

### `/api/payments/create-intent`

Create a payment intent for an appointment.

- **Method**: POST
- **Request Body**:
  ```json
  {
    "appointmentId": "uuid",
    "amount": 10000,
    "currency": "usd"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "clientSecret": "pi_client_secret"
  }
  ```

### `/api/payments/confirm`

Confirm a payment for an appointment.

- **Method**: POST
- **Request Body**:
  ```json
  {
    "appointmentId": "uuid",
    "paymentIntentId": "pi_123456"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "payment": {
      "id": "uuid",
      "appointmentId": "uuid",
      "amount": 10000,
      "currency": "usd",
      "status": "COMPLETED",
      "paymentIntentId": "pi_123456",
      "createdAt": "2023-06-14T14:00:00Z",
      "updatedAt": "2023-06-14T14:00:00Z"
    }
  }
  ```

### `/api/payments/patient/:patientId`

Get payment history for a patient.

- **Method**: GET
- **URL Parameters**: `patientId` - Patient's unique identifier
- **Response**: 
  ```json
  {
    "success": true,
    "payments": [
      {
        "id": "uuid",
        "appointmentId": "uuid",
        "amount": 10000,
        "currency": "usd",
        "status": "COMPLETED",
        "paymentIntentId": "pi_123456",
        "createdAt": "2023-06-14T14:00:00Z",
        "updatedAt": "2023-06-14T14:00:00Z"
      }
    ]
  }
  ```

### `/api/payments/provider/:providerId`

Get payment history for a provider.

- **Method**: GET
- **URL Parameters**: `providerId` - Provider's unique identifier
- **Response**: Same as `/api/payments/patient/:patientId`

## Admin Endpoints

### `/api/admin/users`

Get all users.

- **Method**: GET
- **Query Parameters**: 
  - `role` - Filter by user role
  - `page` - Page number
  - `limit` - Number of users per page
- **Response**: 
  ```json
  {
    "success": true,
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "PATIENT",
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
  }
  ```

### `/api/admin/providers/pending`

Get providers pending approval.

- **Method**: GET
- **Response**: 
  ```json
  {
    "success": true,
    "providers": [
      {
        "id": "uuid",
        "userId": "uuid",
        "specialty": "Cardiology",
        "education": {},
        "experience": {},
        "bio": "Provider bio",
        "status": "PENDING",
        "createdAt": "2023-06-01T12:00:00Z",
        "updatedAt": "2023-06-01T12:00:00Z"
      }
    ]
  }
  ```

### `/api/admin/providers/:id/approve`

Approve a provider.

- **Method**: PUT
- **URL Parameters**: `id` - Provider's unique identifier
- **Response**: 
  ```json
  {
    "success": true,
    "provider": {
      "id": "uuid",
      "userId": "uuid",
      "specialty": "Cardiology",
      "education": {},
      "experience": {},
      "bio": "Provider bio",
      "status": "APPROVED",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T13:00:00Z"
    }
  }
  ```

### `/api/admin/providers/:id/reject`

Reject a provider.

- **Method**: PUT
- **URL Parameters**: `id` - Provider's unique identifier
- **Request Body**:
  ```json
  {
    "reason": "Missing credentials"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "provider": {
      "id": "uuid",
      "userId": "uuid",
      "specialty": "Cardiology",
      "education": {},
      "experience": {},
      "bio": "Provider bio",
      "status": "REJECTED",
      "rejectionReason": "Missing credentials",
      "createdAt": "2023-06-01T12:00:00Z",
      "updatedAt": "2023-06-01T13:00:00Z"
    }
  }
  ```

### `/api/admin/stats`

Get system statistics.

- **Method**: GET
- **Query Parameters**: `period` - Time period (day, week, month, year)
- **Response**: 
  ```json
  {
    "success": true,
    "stats": {
      "users": {
        "total": 1000,
        "patients": 900,
        "providers": 100,
        "newUsers": 50
      },
      "appointments": {
        "total": 500,
        "scheduled": 300,
        "completed": 150,
        "cancelled": 50
      },
      "consultations": {
        "total": 150,
        "audio": 50,
        "video": 100,
        "averageDuration": 20
      },
      "payments": {
        "total": 15000,
        "currency": "usd"
      }
    }
  }
  ```
