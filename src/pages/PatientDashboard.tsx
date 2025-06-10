
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/authProvider';
import { Navigate, Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

const PatientDashboard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated()) {
    return <Navigate to="/booking" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'Patient'}
            </h1>
            <p className="text-gray-600">
              Your health journey with Dr. Fintan Ekochin
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No upcoming appointments</p>
              <Link to="/booking">
                <Button className="mt-4">Book Appointment</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No recent consultations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Health Records</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No health records available</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
