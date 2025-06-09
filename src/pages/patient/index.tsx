import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components for patient pages
const PatientProfile = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">Patient Profile</h1>
    <p>Patient profile management will be implemented here.</p>
  </div>
);

const PatientRecords = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">Medical Records</h1>
    <p>Patient medical records will be displayed here.</p>
  </div>
);

const PatientRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="profile" element={<PatientProfile />} />
      <Route path="records" element={<PatientRecords />} />
      <Route path="*" element={<Navigate to="/patient/profile" replace />} />
    </Routes>
  );
};

export default PatientRoutes;

