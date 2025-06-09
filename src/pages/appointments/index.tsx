
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const AppointmentsList: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Button asChild>
          <Link to="/appointments/book">Book New Appointment</Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>No Appointments</CardTitle>
          <CardDescription>You don't have any appointments scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Book your first appointment to get started with virtual care.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const BookAppointment: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Book Appointment</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Schedule Consultation</CardTitle>
          <CardDescription>Book a new appointment with a healthcare provider</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Booking functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const AppointmentRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppointmentsList />} />
      <Route path="book" element={<BookAppointment />} />
      <Route path="*" element={<AppointmentsList />} />
    </Routes>
  );
};

export default AppointmentRoutes;
