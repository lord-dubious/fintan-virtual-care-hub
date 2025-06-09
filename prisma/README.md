# Virtual Care Hub - Prisma Schema

This directory contains the Prisma schema and related files for the Virtual Care Hub application, a telemedicine platform that enables video/audio consultations between patients and healthcare providers.

## Schema Overview

The database schema is designed to support the following core features:

1. **User Management**
   - Role-based users (patients, providers, admins)
   - Authentication and profile management

2. **Appointment Scheduling**
   - Booking appointments with providers
   - Managing appointment status
   - Provider availability tracking

3. **Video/Audio Consultations**
   - Integration with Daily.co for video/audio calls
   - Session management and tracking
   - Consultation notes and prescriptions

4. **Payment Processing**
   - Support for multiple payment methods (Stripe, Paystack)
   - Payment status tracking
   - Invoice generation

5. **Medical Records**
   - Patient medical history
   - Consultation records
   - Prescription management

## Models

### Core Models

- **User**: Base user model with authentication fields
- **Patient**: Patient-specific information linked to a user
- **Provider**: Healthcare provider information linked to a user
- **Appointment**: Scheduling information for consultations
- **Consultation**: Video/audio session details
- **Payment**: Payment processing information
- **MedicalRecord**: Patient medical history
- **Prescription**: Medication prescriptions from consultations
- **Availability**: Provider availability for scheduling

## Relationships

- A User can be either a Patient, Provider, or Admin (role-based)
- A Patient can have multiple Appointments and MedicalRecords
- A Provider can have multiple Appointments and Availability slots
- An Appointment is linked to one Patient and one Provider
- A Consultation is linked to one Appointment
- A Payment is linked to one Appointment
- A Prescription is linked to one Consultation

## Enums

- **UserRole**: PATIENT, PROVIDER, ADMIN
- **ConsultationType**: VIDEO, AUDIO
- **AppointmentStatus**: SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
- **ConsultationStatus**: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- **PaymentMethod**: STRIPE, PAYSTACK, CREDIT_CARD, BANK_TRANSFER
- **PaymentStatus**: PENDING, COMPLETED, FAILED, REFUNDED

## Services

The application includes the following services to interact with the database:

- **authService**: User authentication and registration
- **patientService**: Patient profile management
- **providerService**: Provider profile and availability management
- **appointmentService**: Appointment scheduling and management
- **consultationService**: Video/audio consultation management
- **paymentService**: Payment processing and tracking
- **medicalRecordService**: Patient medical history management
- **videoCallService**: Integration with Daily.co for video calls
- **audioCallService**: Integration with Daily.co for audio-only calls
- **webrtcService**: Low-level WebRTC functionality

## Seed Data

The `seed.ts` file provides sample data for testing the application, including:

- Admin user
- Sample providers with specializations
- Sample patients with medical history
- Test appointments with consultations
- Payment records
- Availability schedules

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Generate Prisma client:
   ```
   npm run prisma:generate
   ```

3. Run migrations:
   ```
   npm run prisma:migrate
   ```

4. Seed the database:
   ```
   npm run prisma:seed
   ```

5. Start the development server:
   ```
   npm run dev
   ```

