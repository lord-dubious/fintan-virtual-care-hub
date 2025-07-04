
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useVideoCall } from '@/hooks/useVideoCall';
import { audioCallService } from '@/services/audioCallService';
import { notificationService } from '@/services/notificationService';
import VideoCallInterface from '@/components/video/VideoCallInterface';
import AudioCallInterface from '@/components/audio/AudioCallInterface';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Video, VideoOff, AlertCircle, Phone } from 'lucide-react';

const ConsultationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session');
  const appointmentId = searchParams.get('id');
  const callType = searchParams.get('type') || 'video'; // 'video' or 'audio'
  
  const { currentSession: videoSession, isLoading: videoLoading, error: videoError, startCall: startVideoCall, endCall: endVideoCall, joinCall: joinVideoCall } = useVideoCall();
  const [audioSession, setAudioSession] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);
  
  const [hasMediaPermission, setHasMediaPermission] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    checkMediaPermissions();
  }, []);

  const checkMediaPermissions = async () => {
    try {
      const constraints = callType === 'video' ? 
        { video: true, audio: true } : 
        { video: false, audio: true };
        
      await navigator.mediaDevices.getUserMedia(constraints);
      setHasMediaPermission(true);
    } catch (error) {
      const message = callType === 'video' ? 
        'Camera and microphone access required for video consultation' :
        'Microphone access required for audio consultation';
      setPermissionError(message);
      console.error('Media permission denied:', error);
    }
  };

  const handleStartVideoConsultation = async () => {
    if (!hasMediaPermission) {
      await checkMediaPermissions();
      return;
    }

    try {
      if (sessionId) {
        await joinVideoCall(sessionId);
      } else if (appointmentId) {
        const session = await startVideoCall(appointmentId);
        await notificationService.sendConsultationStartNotification(
          appointmentId,
          'patient@example.com',
          session.sessionId
        );
      }
    } catch (error) {
      console.error('Failed to start video consultation:', error);
    }
  };

  const handleStartAudioConsultation = async () => {
    if (!hasMediaPermission) {
      await checkMediaPermissions();
      return;
    }

    setAudioLoading(true);
    setAudioError(null);

    try {
      if (sessionId) {
        const success = await audioCallService.joinSession(sessionId);
        if (success) {
          setAudioSession(audioCallService.getCurrentSession());
        }
      } else if (appointmentId) {
        const session = await audioCallService.createSession(appointmentId);
        const success = await audioCallService.joinSession(session.sessionId, session.roomUrl);
        if (success) {
          setAudioSession(session);
          await notificationService.sendConsultationStartNotification(
            appointmentId,
            'patient@example.com',
            session.sessionId
          );
        }
      }
    } catch (error) {
      setAudioError(error.message);
      console.error('Failed to start audio consultation:', error);
    } finally {
      setAudioLoading(false);
    }
  };

  const handleEndConsultation = async () => {
    if (callType === 'video') {
      await endVideoCall();
    } else {
      if (audioSession) {
        await audioCallService.endSession(audioSession.sessionId);
        setAudioSession(null);
      }
    }
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
              {callType === 'video' ? (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Grant Camera & Microphone Access
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Grant Microphone Access
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show video call interface
  if (callType === 'video' && videoSession) {
    return (
      <VideoCallInterface 
        session={videoSession} 
        onEndCall={handleEndConsultation}
      />
    );
  }

  // Show audio call interface
  if (callType === 'audio' && audioSession) {
    return (
      <AudioCallInterface 
        session={audioSession} 
        onEndCall={handleEndConsultation}
      />
    );
  }

  const currentError = callType === 'video' ? videoError : audioError;
  const currentLoading = callType === 'video' ? videoLoading : audioLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {callType === 'video' ? 'Video Consultation' : 'Audio Consultation'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{currentError}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-medical-primary rounded-full flex items-center justify-center mx-auto">
              {callType === 'video' ? (
                <Video className="h-8 w-8 text-white" />
              ) : (
                <Phone className="h-8 w-8 text-white" />
              )}
            </div>
            
            <div>
              <h3 className="font-semibold">
                Ready to start your {callType} consultation?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {callType === 'video' ? 
                  'Make sure your camera and microphone are working properly.' :
                  'Make sure your microphone is working properly.'
                }
              </p>
            </div>
            
            <Button 
              onClick={callType === 'video' ? handleStartVideoConsultation : handleStartAudioConsultation}
              disabled={currentLoading || !hasMediaPermission}
              className="w-full"
            >
              {currentLoading ? 'Connecting...' : 
                callType === 'video' ? 'Start Video Consultation' : 'Start Audio Consultation'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsultationPage;
