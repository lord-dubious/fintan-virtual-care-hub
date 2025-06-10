
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ProviderDashboard: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Provider Portal</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Appointments</CardTitle>
            <CardDescription>Your scheduled consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <p>No appointments scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Patient Management</CardTitle>
            <CardDescription>Manage your patients</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Patient list and management tools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>Set your available hours</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Configure your schedule</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ProviderRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ProviderDashboard />} />
      <Route path="/dashboard" element={<ProviderDashboard />} />
    </Routes>
  );
};

export default ProviderRoutes;
