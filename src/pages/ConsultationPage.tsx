import React from 'react';
import { useParams } from 'react-router-dom';
import ConsultationRoom from './ConsultationRoom';

const ConsultationPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();

  if (!appointmentId) {
    // This can be replaced with a more user-friendly error component
    return <div>Error: No appointment ID provided.</div>;
  }

  return <ConsultationRoom />;
};

export default ConsultationPage;
