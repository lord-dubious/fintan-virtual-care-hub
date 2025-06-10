
import { useState, useCallback } from 'react';
import { videoCallService, VideoCallSession } from '@/services/videoCallService';

export const useVideoCall = () => {
  const [currentSession, setCurrentSession] = useState<VideoCallSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCall = useCallback(async (appointmentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const session = await videoCallService.createSession(appointmentId);
      setCurrentSession(session);
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start video call';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const endCall = useCallback(async () => {
    if (currentSession) {
      await videoCallService.endSession(currentSession.sessionId);
      setCurrentSession(null);
    }
  }, [currentSession]);

  const joinCall = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await videoCallService.joinSession(sessionId, `https://room.url/${sessionId}`);
      if (!success) {
        throw new Error('Failed to join call');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to join video call';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    currentSession,
    isLoading,
    error,
    startCall,
    endCall,
    joinCall
  };
};
