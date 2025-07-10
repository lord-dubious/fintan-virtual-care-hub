import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components for appointment pages
const AppointmentList = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">My Appointments</h1>
    <p>Appointment list will be displayed here.</p>
  </div>
);

const BookAppointment = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">Book an Appointment</h1>
    <p>Appointment booking interface will be implemented here.</p>
  </div>
);

const AppointmentDetails = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">Appointment Details</h1>
    <p>Appointment details will be displayed here.</p>
  </div>
);

const AppointmentRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<AppointmentList />} />
      <Route path="book" element={<BookAppointment />} />
      <Route path=":id" element={<AppointmentDetails />} />
      <Route path="*" element={<Navigate to="/appointments" replace />} />
    </Routes>
  );
};

export default AppointmentRoutes;

