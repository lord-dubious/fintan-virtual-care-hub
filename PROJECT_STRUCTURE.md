
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
- `AdminDashboard.tsx` - Admin dashboard
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

4. **Responsive Design**
   - Mobile-specific styling (index.css)
   - Adaptive layouts for all device sizes

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
