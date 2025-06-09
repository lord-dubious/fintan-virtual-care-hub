
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/lib/auth/authProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/home';
import Auth from '@/pages/auth';
import Dashboard from '@/pages/dashboard';
import PatientRoutes from '@/pages/patient';
import ProviderRoutes from '@/pages/provider';
import AdminRoutes from '@/pages/admin';
import AppointmentRoutes from '@/pages/appointments';
import ConsultationRoutes from '@/pages/consultation';
import NotFound from '@/pages/not-found';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth/*" element={<Auth />} />
            
            <Route
              path="/"
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/patient/*"
              element={
                <ProtectedRoute requiredRole="PATIENT">
                  <Layout>
                    <PatientRoutes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/provider/*"
              element={
                <ProtectedRoute requiredRole="PROVIDER">
                  <Layout>
                    <ProviderRoutes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <Layout>
                    <AdminRoutes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/appointments/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AppointmentRoutes />
                  </Layout>
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/consultation/*"
              element={
                <ProtectedRoute>
                  <ConsultationRoutes />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
