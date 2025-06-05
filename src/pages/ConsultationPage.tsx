
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVideoCall } from '@/hooks/useVideoCall';
import { notificationService } from '@/services/notificationService';
import VideoCallInterface from '@/components/video/VideoCallInterface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, VideoOff, AlertCircle } from 'lucide-react';

const ConsultationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  const appointmentId = searchParams.get('id');
  
  const { currentSession, isLoading, error, startCall, endCall, joinCall } = useVideoCall();
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    checkMediaPermissions();
  }, []);

  const checkMediaPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setHasMediaPermission(true);
    } catch (error) {
      setPermissionError('Camera and microphone access required for video consultation');
      console.error('Media permission denied:', error);
    }
  };

  const handleStartConsultation = async () => {
    if (!hasMediaPermission) {
      await checkMediaPermissions();
      return;
    }

    try {
      if (sessionId) {
        // Join existing session
        await joinCall(sessionId);
      } else if (appointmentId) {
        // Start new session
        const session = await startCall(appointmentId);
        
        // Notify patient that consultation is ready
        await notificationService.sendConsultationStartNotification(
          appointmentId,
          'patient@example.com', // In real app, get from appointment data
          session.sessionId
        );
      }
    } catch (error) {
      console.error('Failed to start consultation:', error);
    }
  };

  const handleEndConsultation = async () => {
    await endCall();
    navigate('/');
  };

  if (!hasMediaPermission && permissionError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Media Permissions Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <VideoOff className="h-4 w-4" />
              <AlertDescription>
                {permissionError}
              </AlertDescription>
            </Alert>
            <Button onClick={checkMediaPermissions} className="w-full">
              <Video className="h-4 w-4 mr-2" />
              Grant Camera & Microphone Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentSession) {
    return (
      <VideoCallInterface 
        session={currentSession} 
        onEndCall={handleEndConsultation}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Video Consultation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-medical-primary rounded-full flex items-center justify-center mx-auto">
              <Video className="h-8 w-8 text-white" />
            </div>
            
            <div>
              <h3 className="font-semibold">Ready to start your consultation?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Make sure your camera and microphone are working properly.
              </p>
            </div>
            
            <Button 
              onClick={handleStartConsultation}
              disabled={isLoading || !hasMediaPermission}
              className="w-full"
            >
              {isLoading ? 'Connecting...' : 'Start Video Consultation'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultationPage;
