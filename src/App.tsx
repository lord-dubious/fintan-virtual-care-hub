import React from "react";
import { useEffect, useState, Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './components/theme/ThemeProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AuthMigration from './components/auth/AuthMigration';

// Lazy load heavy pages to reduce initial bundle size
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const CalcomBookingPage = lazy(() => import('./pages/CalcomBookingPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation'));
const ConsultationPage = lazy(() => import('./pages/ConsultationPage'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments'));
const AdminPatients = lazy(() => import('./pages/admin/AdminPatients'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const OfflinePage = lazy(() => import('./pages/OfflinePage'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const LoginPage = lazy(() => import('./pages/auth/login'));
const RegisterPage = lazy(() => import('./pages/auth/register'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPassword'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const PatientLayout = lazy(() => import('./components/layout/PatientLayout'));
const PatientDashboardNew = lazy(() => import('./pages/patient/Dashboard'));
const PatientAppointments = lazy(() => import('./pages/patient/Appointments'));
const PatientHealthRecords = lazy(() => import('./pages/patient/HealthRecords'));
const PatientMessages = lazy(() => import('./pages/patient/Messages'));
const PatientSettings = lazy(() => import('./pages/patient/Settings'));
const DoctorLayout = lazy(() => import('./components/layout/DoctorLayout'));
const DoctorDashboardNew = lazy(() => import('./pages/doctor/Dashboard'));
const DoctorAppointments = lazy(() => import('./pages/doctor/Appointments'));
const DoctorPatients = lazy(() => import('./pages/doctor/Patients'));
const DoctorMedicalRecords = lazy(() => import('./pages/doctor/MedicalRecords'));
const DoctorAvailabilitySettings = lazy(() => import('./pages/doctor/AvailabilitySettings'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const SocialAuthDemo = lazy(() => import('./pages/SocialAuthDemo'));
const NewBookingPage = lazy(() => import('./pages/NewBookingPage'));
import DebugAuth from './pages/DebugAuth';
import AuthDebug from '@/components/debug/AuthDebug';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes - reduce refetch on focus
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        if (error && typeof error === 'object' && 'response' in error) {
          const response = (error as { response?: { status?: number } }).response;
          if (response?.status && response.status >= 400 && response.status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
    },
  },
});

const App = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showMigration, setShowMigration] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="fintan-theme">
            <TooltipProvider>
              <Toaster />
              <Sonner />
              {showMigration && (
                <AuthMigration onMigrationComplete={() => setShowMigration(false)} />
              )}
              <BrowserRouter>
                <Suspense fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                }>
                  <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/book-appointment" element={<CalcomBookingPage />} />
                <Route path="/new-booking" element={<NewBookingPage />} />
                <Route path="/booking/confirmation" element={
                  <ProtectedRoute>
                    <BookingConfirmation />
                  </ProtectedRoute>
                } />
                <Route path="/consultation/:appointmentId" element={
                  <ProtectedRoute>
                    <ConsultationPage />
                  </ProtectedRoute>
                } />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/auth/social-demo" element={<SocialAuthDemo />} />
                <Route path="/debug-auth" element={<DebugAuth />} />
                <Route path="/auth-debug" element={<AuthDebug />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute requiredRole="PATIENT">
                    <PatientDashboard />
                  </ProtectedRoute>
                } />

                {/* New Patient Portal Routes */}
                <Route path="/patient" element={
                  <ProtectedRoute requiredRole="PATIENT">
                    <PatientLayout />
                  </ProtectedRoute>
                }>
                  <Route path="dashboard" element={<PatientDashboardNew />} />
                  <Route path="appointments" element={<PatientAppointments />} />
                  <Route path="records" element={<PatientHealthRecords />} />
                  <Route path="messages" element={<PatientMessages />} />
                  <Route path="settings" element={<PatientSettings />} />
                </Route>

                <Route path="/doctor/dashboard" element={
                  <ProtectedRoute requiredRole="DOCTOR">
                    <DoctorDashboard />
                  </ProtectedRoute>
                } />

                {/* New Doctor Portal Routes */}
                <Route path="/doctor" element={
                  <ProtectedRoute requiredRole="DOCTOR">
                    <DoctorLayout />
                  </ProtectedRoute>
                }>
                  <Route path="dashboard" element={<DoctorDashboardNew />} />
                  <Route path="appointments" element={<DoctorAppointments />} />
                  <Route path="patients" element={<DoctorPatients />} />
                  <Route path="records" element={<DoctorMedicalRecords />} />
                  <Route path="messages" element={<div>Messages - Coming Soon</div>} />
                  <Route path="analytics" element={<div>Analytics - Coming Soon</div>} />
                  <Route path="schedule" element={<DoctorAvailabilitySettings />} />
                  <Route path="settings" element={<div>Settings - Coming Soon</div>} />
                </Route>
                <Route path="/payment/:appointmentId" element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                } />
                <Route path="/payment/success" element={
                  <ProtectedRoute>
                    <PaymentSuccessPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="appointments" element={<AdminAppointments />} />
                  <Route path="patients" element={<AdminPatients />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                <Route path="/offline" element={<OfflinePage />} />
                <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;