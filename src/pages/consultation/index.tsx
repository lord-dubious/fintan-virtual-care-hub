import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ConsultationRoom from './ConsultationRoom';

const ConsultationRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path=":consultationId" element={<ConsultationRoom />} />
    </Routes>
  );
};

export default ConsultationRoutes;

