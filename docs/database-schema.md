# Database Schema

This document provides a visual and descriptive overview of the database schema for the Fintan Virtual Care Hub.

## Entity Relationship Diagram

```
+----------------+       +----------------+       +----------------+
|      User      |       |     Patient    |       |    Provider    |
+----------------+       +----------------+       +----------------+
| id             |<----->| id             |       | id             |
| email          |       | userId         |<---+  | userId         |<---+
| password       |       | medicalHistory |    |  | specialty      |    |
| name           |       | insurance      |    |  | education      |    |
| role           |       | dateOfBirth    |    |  | experience     |    |
| createdAt      |       | address        |    |  | availability   |    |
| updatedAt      |       | phone          |    |  | bio            |    |
+----------------+       +----------------+    |  +----------------+    |
                                               |                        |
                                               |                        |
+----------------+       +----------------+    |  +----------------+    |
|   Appointment  |       | Consultation   |    |  |  Availability  |    |
+----------------+       +----------------+    |  +----------------+    |
| id             |       | id             |    |  | id             |    |
| patientId      |------>| appointmentId  |<---+  | providerId     |----+
| providerId     |------>| roomUrl        |    |  | dayOfWeek      |
| date           |       | status         |    |  | startTime      |
| status         |       | videoEnabled   |    |  | endTime        |
| consultationType|       | notes          |    |  | isAvailable    |
| reason         |       | createdAt      |    |  +----------------+
| createdAt      |       | updatedAt      |    |
| updatedAt      |       +----------------+    |
+----------------+                             |
                                               |
+----------------+       +----------------+    |
| MedicalRecord  |       |  Notification  |    |
+----------------+       +----------------+    |
| id             |       | id             |    |
| patientId      |------>| userId         |----+
| providerId     |------>| type           |
| consultationId |------>| title          |
| diagnosis      |       | message        |
| notes          |       | read           |
| prescriptions  |       | relatedId      |
| createdAt      |       | createdAt      |
| updatedAt      |       +----------------+
+----------------+
```

## Tables Description

### User

The central entity that represents all users in the system.

| Column    | Type      | Description                                   |
|-----------|-----------|-----------------------------------------------|
| id        | UUID      | Primary key                                   |
| email     | String    | User's email address (unique)                 |
| password  | String    | Hashed password                               |
| name      | String    | User's full name                              |
| role      | Enum      | User role (PATIENT, PROVIDER, ADMIN)          |
| createdAt | DateTime  | Timestamp of creation                         |
| updatedAt | DateTime  | Timestamp of last update                      |

### Patient

Extends the User entity with patient-specific information.

| Column         | Type      | Description                               |
|----------------|-----------|-------------------------------------------|
| id             | UUID      | Primary key                               |
| userId         | UUID      | Foreign key to User                       |
| medicalHistory | JSON      | Patient's medical history                 |
| insurance      | JSON      | Insurance information                     |
| dateOfBirth    | DateTime  | Patient's date of birth                   |
| address        | String    | Patient's address                         |
| phone          | String    | Patient's phone number                    |

### Provider

Extends the User entity with provider-specific information.

| Column       | Type      | Description                                 |
|--------------|-----------|---------------------------------------------|
| id           | UUID      | Primary key                                 |
| userId       | UUID      | Foreign key to User                         |
| specialty    | String    | Provider's medical specialty                |
| education    | JSON      | Educational background                      |
| experience   | JSON      | Professional experience                     |
| bio          | String    | Professional biography                      |

### Appointment

Represents a scheduled appointment between a patient and provider.

| Column           | Type      | Description                             |
|------------------|-----------|-----------------------------------------|
| id               | UUID      | Primary key                             |
| patientId        | UUID      | Foreign key to Patient                  |
| providerId       | UUID      | Foreign key to Provider                 |
| date             | DateTime  | Date and time of appointment            |
| status           | Enum      | Status (SCHEDULED, COMPLETED, CANCELLED)|
| consultationType | Enum      | Type (AUDIO, VIDEO)                     |
| reason           | String    | Reason for appointment                  |
| createdAt        | DateTime  | Timestamp of creation                   |
| updatedAt        | DateTime  | Timestamp of last update                |

### Consultation

Represents an audio/video consultation session.

| Column        | Type      | Description                               |
|---------------|-----------|-------------------------------------------|
| id            | UUID      | Primary key                               |
| appointmentId | UUID      | Foreign key to Appointment                |
| roomUrl       | String    | URL for the Daily.co room                 |
| status        | Enum      | Status (SCHEDULED, IN_PROGRESS, COMPLETED)|
| videoEnabled  | Boolean   | Whether video is enabled                  |
| notes         | String    | Provider's notes during consultation      |
| createdAt     | DateTime  | Timestamp of creation                     |
| updatedAt     | DateTime  | Timestamp of last update                  |

### Availability

Represents a provider's availability schedule.

| Column      | Type      | Description                                 |
|-------------|-----------|---------------------------------------------|
| id          | UUID      | Primary key                                 |
| providerId  | UUID      | Foreign key to Provider                     |
| dayOfWeek   | Enum      | Day of week (MONDAY, TUESDAY, etc.)         |
| startTime   | Time      | Start time of availability                  |
| endTime     | Time      | End time of availability                    |
| isAvailable | Boolean   | Whether the provider is available           |

### MedicalRecord

Represents a medical record created during or after a consultation.

| Column         | Type      | Description                               |
|----------------|-----------|-------------------------------------------|
| id             | UUID      | Primary key                               |
| patientId      | UUID      | Foreign key to Patient                    |
| providerId     | UUID      | Foreign key to Provider                   |
| consultationId | UUID      | Foreign key to Consultation               |
| diagnosis      | String    | Diagnosis information                     |
| notes          | String    | Clinical notes                            |
| prescriptions  | JSON      | Prescribed medications                    |
| createdAt      | DateTime  | Timestamp of creation                     |
| updatedAt      | DateTime  | Timestamp of last update                  |

### Notification

Represents system notifications for users.

| Column    | Type      | Description                                   |
|-----------|-----------|-----------------------------------------------|
| id        | UUID      | Primary key                                   |
| userId    | UUID      | Foreign key to User                           |
| type      | Enum      | Notification type                             |
| title     | String    | Notification title                            |
| message   | String    | Notification message                          |
| read      | Boolean   | Whether the notification has been read        |
| relatedId | UUID      | ID of related entity (appointment, etc.)      |
| createdAt | DateTime  | Timestamp of creation                         |

## Relationships

- **User-Patient**: One-to-one relationship. A User with role PATIENT has one Patient record.
- **User-Provider**: One-to-one relationship. A User with role PROVIDER has one Provider record.
- **Patient-Appointment**: One-to-many relationship. A Patient can have many Appointments.
- **Provider-Appointment**: One-to-many relationship. A Provider can have many Appointments.
- **Appointment-Consultation**: One-to-one relationship. An Appointment has one Consultation.
- **Provider-Availability**: One-to-many relationship. A Provider has many Availability slots.
- **Patient-MedicalRecord**: One-to-many relationship. A Patient can have many MedicalRecords.
- **Provider-MedicalRecord**: One-to-many relationship. A Provider can create many MedicalRecords.
- **Consultation-MedicalRecord**: One-to-one relationship. A Consultation can have one MedicalRecord.
- **User-Notification**: One-to-many relationship. A User can have many Notifications.

