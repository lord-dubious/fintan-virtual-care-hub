# Database Schema

This document provides a visual and descriptive overview of the database schema for the Fintan Virtual Care Hub.

## Entity Relationship Diagram

```
+----------------+       +----------------+       +----------------+
|      User      |       |     Patient    |       |    Provider    |
+----------------+       +----------------+       +----------------+
| id             |<----->| id             |       | id             |
| email          |       | userId         |<---+  | userId         |<---+
| password       |       | firstName      |    |  | specialization |    |
| name           |       | lastName       |    |  | bio            |    |
| role           |       | dateOfBirth    |    |  | avatarUrl      |    |
| phone          |       | phone          |    |  | createdAt      |    |
| createdAt      |       | createdAt      |    |  | updatedAt      |    |
| updatedAt      |       | updatedAt      |    |  +----------------+    |
+----------------+       +----------------+    |                        |
                                               |                        |
+----------------+       +----------------+    |  +----------------+    |
|   Appointment  |       | Consultation   |    |  |  Availability  |    |
+----------------+       +----------------+    |  +----------------+    |
| id             |       | id             |    |  | id             |    |
| patientId      |------>| appointmentId  |<---+  | providerId     |----+
| providerId     |------>| sessionId      |?   |  | dayOfWeek      |
| appointmentDate|       | roomUrl        |?   |  | startTime      |
| reason         |       | status         |    |  | endTime        |
| status         |       | videoEnabled   |    |  | isActive       |
| consultationType|       | notes          |    |  | createdAt      |
| createdAt      |       | startTime      |?   |  | updatedAt      |
| updatedAt      |       | endTime        |?   |  +----------------+
+----------------+       | createdAt      |    |
                         | updatedAt      |    |
                         +----------------+    |
                                               |
+----------------+       +----------------+    |
| MedicalRecord  |       |  Notification  |    |
+----------------+       +----------------+    |
| id             |       | id             |    |
| patientId      |------>| userId         |----+
| title          |       | title          |
| description    |       | message        |
| recordType     |       | type           |
| attachments    |       | isRead         |
| createdAt      |       | link           |
| updatedAt      |       | relatedId      |
+----------------+       | createdAt      |
                         | updatedAt      |
                         +----------------+

+----------------+
|     Payment    |
+----------------+
| id             |
| appointmentId  |----->
| amount         |
| currency       |
| provider       |
| status         |
| paymentMethod  |
| reference      |?
| transactionId  |?
| receiptUrl     |?
| createdAt      |
| updatedAt      |
+----------------+
```

## Tables Description

### User

The central entity that represents all users in the system.

| Column        | Type      | Description                                   |
|---------------|-----------|-----------------------------------------------|
| id            | UUID      | Primary key                                   |
| email         | String    | User's email address (unique)                 |
| password      | String    | Hashed password                               |
| name          | String    | User's full name                              |
| role          | Enum      | User role (PATIENT, PROVIDER, ADMIN, DOCTOR)  |
| phone         | String?   | User's phone number (optional)                |
| createdAt     | DateTime  | Timestamp of creation                         |
| updatedAt     | DateTime  | Timestamp of last update                      |

### Patient

Extends the User entity with patient-specific information.

| Column           | Type      | Description                               |
|------------------|-----------|-------------------------------------------|
| id               | UUID      | Primary key                               |
| userId           | UUID      | Foreign key to User                       |
| firstName        | String?   | Patient's first name (optional)           |
| lastName         | String?   | Patient's last name (optional)            |
| dateOfBirth      | DateTime? | Patient's date of birth (optional)        |
| phone            | String?   | Patient's phone number (optional)         |
| onboardingStatus | Enum      | Onboarding status (INCOMPLETE, IN_PROGRESS, COMPLETED) |
| onboardingStep   | Int       | Current step in onboarding process        |
| createdAt        | DateTime  | Timestamp of creation                     |
| updatedAt        | DateTime  | Timestamp of last update                  |

### Provider

Extends the User entity with provider-specific information.

| Column         | Type      | Description                                 |
|----------------|-----------|---------------------------------------------|
| id             | UUID      | Primary key                                 |
| userId         | UUID      | Foreign key to User                         |
| specialization | String?   | Provider's medical specialization (optional)|
| bio            | String?   | Professional biography (optional)           |
| avatarUrl      | String?   | URL to provider's avatar image (optional)   |
| createdAt      | DateTime  | Timestamp of creation                       |
| updatedAt      | DateTime  | Timestamp of last update                    |

### Appointment

Represents a scheduled appointment between a patient and provider.

| Column           | Type      | Description                             |
|------------------|-----------|-----------------------------------------|
| id               | UUID      | Primary key                             |
| patientId        | UUID      | Foreign key to Patient                  |
| providerId       | UUID      | Foreign key to Provider                 |
| appointmentDate  | DateTime  | Date and time of appointment            |
| reason           | String?   | Reason for appointment (optional)       |
| status           | Enum      | Status (SCHEDULED, COMPLETED, CANCELLED, etc.)|
| consultationType | Enum      | Type (VIDEO, AUDIO)                     |
| createdAt        | DateTime  | Timestamp of creation                   |
| updatedAt        | DateTime  | Timestamp of last update                |

### Consultation

Represents an audio/video consultation session.

| Column        | Type      | Description                               |
|---------------|-----------|-------------------------------------------|
| id            | UUID      | Primary key                               |
| appointmentId | UUID      | Foreign key to Appointment (unique)       |
| sessionId     | String?   | Unique ID for the Daily.co session (optional)|
| roomUrl       | String?   | URL for the Daily.co room (optional)      |
| status        | Enum      | Status (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)|
| videoEnabled  | Boolean   | Whether video is enabled                  |
| notes         | String?   | Provider's notes during consultation (optional)|
| startTime     | DateTime? | Actual start time of consultation (optional)|
| endTime       | DateTime? | Actual end time of consultation (optional)|
| createdAt     | DateTime  | Timestamp of creation                     |
| updatedAt     | DateTime  | Timestamp of last update                  |

### Availability

Represents a provider's availability schedule.

| Column      | Type      | Description                                 |
|-------------|-----------|---------------------------------------------|
| id          | UUID      | Primary key                                 |
| providerId  | UUID      | Foreign key to Provider                     |
| dayOfWeek   | Int       | Day of week (0=Sunday, 6=Saturday)          |
| startTime   | String    | Start time of availability (HH:MM format)   |
| endTime     | String    | End time of availability (HH:MM format)     |
| isActive    | Boolean   | Whether the availability slot is active     |
| createdAt   | DateTime  | Timestamp of creation                       |
| updatedAt   | DateTime  | Timestamp of last update                    |

### MedicalRecord

Represents a medical record created during or after a consultation.

| Column         | Type      | Description                               |
|----------------|-----------|-------------------------------------------|
| id             | UUID      | Primary key                               |
| patientId      | UUID      | Foreign key to Patient                    |
| title          | String    | Title of the medical record               |
| description    | String?   | Detailed description (optional)           |
| recordType     | String    | Type of record (e.g., "GENERAL", "LAB_RESULT")|
| attachments    | String[]  | URLs or paths to attachments              |
| createdAt      | DateTime  | Timestamp of creation                     |
| updatedAt      | DateTime  | Timestamp of last update                  |

### Notification

Represents system notifications for users.

| Column    | Type      | Description                                   |
|-----------|-----------|-----------------------------------------------|
| id        | UUID      | Primary key                                   |
| userId    | UUID      | Foreign key to User                           |
| title     | String    | Notification title                            |
| message   | String    | Notification message                          |
| type      | String    | Notification type (e.g., "APPOINTMENT_REMINDER")|
| isRead    | Boolean   | Whether the notification has been read        |
| link      | String?   | URL link related to the notification (optional)|
| relatedId | String?   | ID of related entity (appointment, etc.) (optional)|
| createdAt | DateTime  | Timestamp of creation                         |
| updatedAt | DateTime  | Timestamp of last update                      |

### Payment

Records payment transactions.

| Column        | Type      | Description                               |
|---------------|-----------|-------------------------------------------|
| id            | UUID      | Primary key                               |
| appointmentId | UUID      | Foreign key to Appointment (unique)       |
| amount        | Int       | Amount of the payment in minor units      |
| currency      | String    | Currency code (e.g., "USD")               |
| provider      | String    | Payment gateway provider (e.g., "STRIPE") |
| status        | Enum      | Payment status (INITIATED, SUCCEEDED, etc.)|
| paymentMethod | Enum      | Method used for payment                   |
| reference     | String?   | Gateway-specific transaction reference (optional)|
| transactionId | String?   | Gateway-specific transaction ID (optional)|
| receiptUrl    | String?   | URL to payment receipt (optional)         |
| createdAt     | DateTime  | Timestamp of creation                     |
| updatedAt     | DateTime  | Timestamp of last update                  |

## Relationships

- **User-Patient**: One-to-one relationship. A User with role PATIENT has one Patient record.
- **User-Provider**: One-to-one relationship. A User with role PROVIDER has one Provider record.
- **Patient-Appointment**: One-to-many relationship. A Patient can have many Appointments.
- **Provider-Appointment**: One-to-many relationship. A Provider can have many Appointments.
- **Appointment-Consultation**: One-to-one relationship. An Appointment has one Consultation.
- **Provider-Availability**: One-to-many relationship. A Provider has many Availability slots.
- **Patient-MedicalRecord**: One-to-many relationship. A Patient can have many MedicalRecords.
- **User-Notification**: One-to-many relationship. A User can have many Notifications.
- **Appointment-Payment**: One-to-one relationship. An Appointment can have one Payment.
