import React from "react";
import { Routes, Route, Navigate } from 'react-router-dom';

// Placeholder components for consultation pages
const ConsultationRoom = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">Consultation Room</h1>
    <p>Virtual consultation interface will be implemented here.</p>
  </div>
);

const ConsultationHistory = () => (
  <div className="container mx-auto py-8">
    <h1 className="text-2xl font-bold mb-4">Consultation History</h1>
    <p>Past consultations will be displayed here.</p>
  </div>
);

const ConsultationRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="room/:id" element={<ConsultationRoom />} />
      <Route path="history" element={<ConsultationHistory />} />
      <Route path="*" element={<Navigate to="/consultation/history" replace />} />
    </Routes>
  );
};

export default ConsultationRoutes;

