import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AudioCallInterface from '@/components/audio/AudioCallInterface';

interface ConsultationPageParams {
  id?: string;
}

const ConsultationPage: React.FC = () => {
  const { id } = useParams<ConsultationPageParams>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState<any>(null); // Replace 'any' with your Consultation type

  useEffect(() => {
    if (id) {
      fetchConsultation(id);
    } else {
      console.error('Consultation ID is missing');
      navigate('/dashboard');
    }
  }, [id, navigate]);

  const fetchConsultation = async (consultationId: string) => {
    setLoading(true);
    try {
      // Mock API call - replace with actual implementation
      const mockConsultation = {
        id: consultationId,
        patientId: 'patient123',
        providerId: 'provider456',
        status: 'SCHEDULED',
        scheduledAt: new Date(),
        notes: 'Patient is experiencing symptoms...',
      };
      setConsultation(mockConsultation);
    } catch (error) {
      console.error('Failed to fetch consultation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertDescription>Loading consultation...</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertDescription>Consultation not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Consultation Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Consultation ID: {consultation.id}</p>
          <p>Status: {consultation.status}</p>
          <p>Scheduled At: {consultation.scheduledAt.toString()}</p>
          <p>Notes: {consultation.notes}</p>

          <AudioCallInterface />

          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultationPage;
