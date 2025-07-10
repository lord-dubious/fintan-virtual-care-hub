import React from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useJoinConsultation } from '@/hooks/useConsultations';
import { Button } from '@/components/ui/button';
import VideoCallInterface from '@/components/video/VideoCallInterface';
import { Loader as Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

const ConsultationRoom: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const {
    data: joinData,
    mutate: joinConsultation,
    isPending: isJoining,
    isError,
  } = useJoinConsultation();

  React.useEffect(() => {
    if (appointmentId) {
      joinConsultation(appointmentId);
    }
  }, [appointmentId, joinConsultation]);

  const handleCallEnd = () => {
    // Navigate back to the dashboard or appointments list after the call
    navigate('/dashboard'); 
  };

  if (isJoining || !joinData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center gap-4 p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-lg font-medium">Preparing your secure consultation room...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
       <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <Alert variant="destructive" className="max-w-md">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Failed to Join Consultation</AlertTitle>
          <AlertDescription>
            Unable to join the consultation. Please try again or contact support.
            <Button onClick={() => navigate(-1)} className="mt-4 w-full">Go Back</Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <VideoCallInterface
      roomUrl={joinData.roomUrl}
      token={joinData.token}
      onCallEnd={handleCallEnd}
    />
  );
};

export default ConsultationRoom;

