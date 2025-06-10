
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PatientDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Patient Portal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Appointments</CardTitle>
            <CardDescription>View and manage your appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No upcoming appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medical Records</CardTitle>
            <CardDescription>Access your medical history</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Your medical records will appear here</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Book Appointment</CardTitle>
            <CardDescription>Schedule a new consultation</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Click to book a new appointment</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const PatientRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PatientDashboard />} />
      <Route path="/dashboard" element={<PatientDashboard />} />
    </Routes>
  );
};

export default PatientRoutes;
