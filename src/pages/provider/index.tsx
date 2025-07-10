import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components for provider pages
const ProviderProfile = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">Provider Profile</h1>
    <p>Provider profile management will be implemented here.</p>
  </div>
);

const ProviderSchedule = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">Provider Schedule</h1>
    <p>Provider schedule management will be implemented here.</p>
  </div>
);

const ProviderPatients = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">My Patients</h1>
    <p>Provider's patient list will be displayed here.</p>
  </div>
);

const ProviderRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="profile" element={<ProviderProfile />} />
      <Route path="schedule" element={<ProviderSchedule />} />
      <Route path="patients" element={<ProviderPatients />} />
      <Route path="*" element={<Navigate to="/provider/profile" replace />} />
    </Routes>
  );
};

export default ProviderRoutes;

