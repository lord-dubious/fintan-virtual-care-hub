# Fintan Virtual Care Hub - Site Map

This document provides a comprehensive overview of the site structure and navigation flow for the Fintan Virtual Care Hub platform.

## User Roles

The platform supports three primary user roles, each with different access levels and features:

1. **Patient** - End users seeking medical consultations
2. **Provider** - Medical professionals providing consultations
3. **Admin** - System administrators managing the platform

## Site Structure

```
Fintan Virtual Care Hub
├── Public Pages
│   ├── Home
│   ├── About
│   ├── Services
│   ├── Providers Directory
│   ├── FAQ
│   ├── Contact
│   └── Blog
│
├── Authentication
│   ├── Login
│   ├── Register
│   │   ├── Patient Registration
│   │   └── Provider Registration (requires approval)
│   ├── Forgot Password
│   └── Reset Password
│
├── Patient Portal
│   ├── Dashboard
│   │   ├── Upcoming Appointments
│   │   ├── Recent Consultations
│   │   ├── Notifications
│   │   └── Quick Actions
│   ├── Profile
│   │   ├── Personal Information
│   │   ├── Medical History
│   │   ├── Insurance Information
│   │   └── Account Settings
│   ├── Appointments
│   │   ├── Book New Appointment
│   │   │   ├── Select Provider
│   │   │   ├── Select Date/Time
│   │   │   ├── Select Consultation Type (Audio/Video)
│   │   │   └── Confirm & Pay
│   │   ├── View All Appointments
│   │   ├── Reschedule Appointment
│   │   └── Cancel Appointment
│   ├── Consultations
│   │   ├── Join Consultation Room
│   │   │   ├── Audio Call Interface
│   │   │   └── Video Call Interface
│   │   └── Past Consultations
│   ├── Medical Records
│   │   ├── View Records
│   │   └── Request Records
│   ├── Prescriptions
│   │   ├── Active Prescriptions
│   │   └── Prescription History
│   ├── Billing
│   │   ├── Payment Methods
│   │   ├── Insurance Claims
│   │   └── Billing History
│   └── Messages
│       ├── Provider Messages
│       └── System Notifications
│
├── Provider Portal
│   ├── Dashboard
│   │   ├── Today's Schedule
│   │   ├── Upcoming Appointments
│   │   ├── Patient Requests
│   │   └── Quick Actions
│   ├── Profile
│   │   ├── Professional Information
│   │   ├── Specialties
│   │   ├── Availability Settings
│   │   └── Account Settings
│   ├── Appointments
│   │   ├── Calendar View
│   │   ├── List View
│   │   ├── Block Time Slots
│   │   └── Set Recurring Availability
│   ├── Consultations
│   │   ├── Start Consultation
│   │   │   ├── Audio Call Interface
│   │   │   └── Video Call Interface (with video request capability)
│   │   └── Consultation History
│   ├── Patients
│   │   ├── Patient Directory
│   │   └── Patient Records
│   ├── Prescriptions
│   │   ├── Write Prescription
│   │   └── Prescription History
│   ├── Billing
│   │   ├── Earnings Summary
│   │   └── Transaction History
│   └── Messages
│       ├── Patient Messages
│       └── System Notifications
│
└── Admin Portal
    ├── Dashboard
    │   ├── System Overview
    │   ├── User Statistics
    │   └── Platform Activity
    ├── User Management
    │   ├── Patients
    │   ├── Providers
    │   │   ├── Approval Requests
    │   │   └── Verification Management
    │   └── Administrators
    ├── Appointment Management
    │   ├── All Appointments
    │   └── Scheduling Rules
    ├── Consultation Management
    │   ├── Active Consultations
    │   └── Consultation Analytics
    ├── Content Management
    │   ├── Blog Posts
    │   ├── FAQs
    │   └── System Notifications
    ├── Billing Management
    │   ├── Payment Processing
    │   ├── Insurance Integration
    │   └── Financial Reports
    └── System Settings
        ├── Platform Configuration
        ├── Email Templates
        ├── Security Settings
        └── Integration Management
```

## Navigation Flows

### Patient User Flow

1. **Registration & Onboarding**
   - Register as a new patient
   - Complete profile with medical history
   - Add payment method

2. **Booking an Appointment**
   - Browse available providers
   - Select provider
   - Choose appointment date/time
   - Select consultation type (audio/video)
   - Confirm and pay for appointment

3. **Attending a Consultation**
   - Receive appointment reminder
   - Join consultation room
   - Participate in audio/video call
   - Receive post-consultation summary

4. **Follow-up Actions**
   - View prescribed medications
   - Schedule follow-up appointment
   - Access medical records

### Provider User Flow

1. **Registration & Onboarding**
   - Register as a provider
   - Complete professional profile
   - Set availability schedule
   - Await approval

2. **Managing Appointments**
   - View daily/weekly schedule
   - Block unavailable time slots
   - Receive appointment notifications

3. **Conducting Consultations**
   - Review patient information
   - Start consultation session
   - Request video if needed (for audio calls)
   - Document consultation notes

4. **Post-Consultation Actions**
   - Write prescriptions
   - Schedule follow-up appointments
   - Update patient records

### Admin User Flow

1. **Provider Management**
   - Review provider applications
   - Verify credentials
   - Approve/reject applications

2. **Platform Monitoring**
   - View system analytics
   - Monitor active consultations
   - Track user engagement

3. **Content Management**
   - Update website content
   - Manage system notifications
   - Create blog posts

4. **Financial Management**
   - Process payments
   - Handle refunds
   - Generate financial reports

## API Endpoints

The platform uses a RESTful API structure with the following main endpoints:

- `/api/auth/*` - Authentication endpoints
- `/api/patients/*` - Patient-related endpoints
- `/api/providers/*` - Provider-related endpoints
- `/api/appointments/*` - Appointment management endpoints
- `/api/consultations/*` - Consultation-related endpoints
- `/api/medical-records/*` - Medical records endpoints
- `/api/prescriptions/*` - Prescription management endpoints
- `/api/billing/*` - Billing and payment endpoints
- `/api/admin/*` - Admin-only endpoints

## Technology Stack

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Real-time Communication**: Daily.co SDK
- **Authentication**: JWT, bcrypt
- **Payment Processing**: Stripe
- **Hosting**: Vercel

