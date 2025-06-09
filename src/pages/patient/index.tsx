
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PatientDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Patient Dashboard</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Health Records</CardTitle>
            <CardDescription>View your medical history</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Access your consultation notes and medical records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No upcoming appointments
            </p>
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
      <Route path="*" element={<PatientDashboard />} />
    </Routes>
  );
};

export default PatientRoutes;
