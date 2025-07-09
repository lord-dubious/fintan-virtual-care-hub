
# Dr. Fintan Virtual Care Hub - Project Structure

This document provides a map of the project structure, explaining the purpose and location of key components, pages, and elements.

## Project Overview

This is a virtual healthcare platform for Dr. Fintan, allowing patients to book consultations and access medical services remotely.

## Directory Structure

### Main Application Files

- `src/main.tsx` - Application entry point
- `src/App.tsx` - Main application component with routing configuration
- `src/index.css` - Global CSS styling

### Pages

Located in `src/pages/`:

- `Index.tsx` - Homepage
- `AboutPage.tsx` - About Dr. Fintan page
- `ServicesPage.tsx` - Services offered page
- `BookingPage.tsx` - Consultation booking interface
- `BookingConfirmation.tsx` - Booking confirmation page
- `FaqPage.tsx` - Frequently asked questions page
- `ContactPage.tsx` - Contact information page
- `NotFound.tsx` - 404 page
- `OfflinePage.tsx` - Displayed when the user is offline

#### Admin Section

Located in `src/pages/admin/`:

- `AdminLogin.tsx` - Admin login page
- `AdminDashboard.tsx` - Admin dashboard with overview statistics and upcoming appointments
- `AdminAppointments.tsx` - Appointment management
- `AdminPatients.tsx` - Patient records management
- `AdminSettings.tsx` - Admin settings

### Components

#### Layout Components

Located in `src/components/layout/`:

- `Navbar.tsx` - Main navigation bar
- `Footer.tsx` - Site footer
- `BreadcrumbNav.tsx` - Breadcrumb navigation

#### Home Page Components

Located in `src/components/home/`:

- `Hero.tsx` - Hero section on homepage
- `ServiceOverview.tsx` - Overview of services offered
- `AboutSection.tsx` - About section on homepage
- `HowItWorks.tsx` - Process explanation section
- `Testimonials.tsx` - Customer testimonials
- `CTASection.tsx` - Call-to-action section

#### Booking Components

Located in `src/components/booking/`:

- `ConsultationTypeStep.tsx` - First step in booking process (consultation type selection)
- `DateTimeStep.tsx` - Second step in booking process (date and time selection)
- `PatientInfoStep.tsx` - Third step in booking process (patient information)
- `PaymentStep.tsx` - Final step in booking process (payment)
- `BookingCalendar.tsx` - Calendar selection component

#### Admin Components

Located in `src/components/admin/`:

- `AdminLayout.tsx` - Layout wrapper for admin section
  - Handles authentication state
  - Provides navigation sidebar/mobile menu
  - Manages logout functionality
  - Responsive design for both desktop and mobile views

#### UI Components

Located in `src/components/ui/`:

These are shadcn/ui components that provide the design system:

- Button, Card, Dialog, Form components, etc.

### Hooks

Located in `src/hooks/`:

- `use-mobile.tsx` - Hook for responsive mobile detection
- `use-toast.ts` - Toast notification hook

### Utilities

Located in `src/lib/`:

- `utils.ts` - Utility functions

## Key Features

1. **Virtual Consultations**
   - Video consultations (ServiceOverview.tsx)
   - Audio consultations (ServiceOverview.tsx)

2. **Booking System**
   - Multi-step booking process (components/booking/*)
   - Calendar integration (BookingCalendar.tsx)

3. **Admin Dashboard**
   - Appointment management (AdminAppointments.tsx)
   - Patient management (AdminPatients.tsx)
   - Statistical overview (AdminDashboard.tsx)
   - Settings management (AdminSettings.tsx)

## Admin Dashboard Architecture

### Current Implementation

The admin dashboard currently uses mock data with a simple local storage-based authentication system. Key components include:

- `AdminDashboard.tsx`: Contains the main dashboard with statistics cards and appointment listings
  - StatCard component for displaying metrics
  - AppointmentItem component for listing upcoming appointments
- `AdminLayout.tsx`: Provides the layout structure with authentication handling
  - Responsive sidebar/navigation menu
  - Authentication state management
  - Route protection logic

### Database Integration Plan (Prisma)

To integrate Prisma ORM for database connectivity:

1. **Schema Definition**
   - Create a `prisma/schema.prisma` file to define data models:
     ```prisma
     model Appointment {
       id          String   @id @default(cuid())
       patientId   String
       patient     Patient  @relation(fields: [patientId], references: [id])
       dateTime    DateTime
       type        String   // "Video" or "Audio"
       status      String   // "Scheduled", "Completed", "Cancelled"
       notes       String?
       createdAt   DateTime @default(now())
       updatedAt   DateTime @updatedAt
     }

     model Patient {
       id          String        @id @default(cuid())
       name        String
       email       String        @unique
       phone       String?
       appointments Appointment[]
       medicalHistory String?
       createdAt   DateTime      @default(now())
       updatedAt   DateTime      @updatedAt
     }

     model User {
       id          String   @id @default(cuid())
       email       String   @unique
       password    String   // Hashed password
       role        String   // "admin", "doctor", etc.
       createdAt   DateTime @default(now())
       updatedAt   DateTime @updatedAt
     }
     ```

2. **Service Layer**
   - Create services in `src/lib/services/`:
     - `appointmentService.ts` - CRUD operations for appointments
     - `patientService.ts` - CRUD operations for patients
     - `authService.ts` - Authentication and user management

3. **Data Fetching Implementation**
   - Replace mock data in admin components with React Query hooks:
     - `useAppointments.ts` - For fetching and managing appointment data
     - `usePatients.ts` - For fetching and managing patient data
     - `useAuth.ts` - For authentication operations

4. **API Routes**
   - Create API endpoints to interact with the Prisma client

## Color Scheme

The application uses a medical-themed color scheme:
- Primary: #1A5F7A (dark teal)
- Secondary: #00A9A5 (teal)
- Accent: #57CBC8 (light teal)
- Multiple neutral tones for text and backgrounds

## Theme System

The application supports both light and dark modes through ThemeProvider.tsx.

## Styling Approach

- Tailwind CSS for styling components
- Global styles defined in index.css
- Component-specific styles within each component file
