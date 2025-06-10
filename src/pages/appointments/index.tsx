
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AppointmentsDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Appointments</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No upcoming appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Appointments</CardTitle>
            <CardDescription>Your consultation history</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No past appointments</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AppointmentRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppointmentsDashboard />} />
    </Routes>
  );
};

export default AppointmentRoutes;
