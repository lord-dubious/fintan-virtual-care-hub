import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX } from 'lucide-react';
import { webrtcService, WebRTCParticipant } from '@/services/webrtcService';

interface AudioCallInterfaceProps {
  consultationId: string;
  onCallEnd?: () => void;
}

export const AudioCallInterface: React.FC<AudioCallInterfaceProps> = ({
  consultationId,
  onCallEnd
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [participants, setParticipants] = useState<WebRTCParticipant[]>([]);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = async () => {
    try {
      // Use participant id instead of session_id
      const currentParticipants = participants.map(p => ({
        ...p,
        id: p.id || `participant-${Date.now()}`
      }));
      setParticipants(currentParticipants);
      setIsCallActive(true);
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    if (onCallEnd) {
      onCallEnd();
    }
  };

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(prev => !prev);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Audio Call</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="text-lg font-semibold">
          {isCallActive ? 'Call in progress' : 'Waiting to connect...'}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Consultation ID: {consultationId}
        </div>
        {isCallActive && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Duration: {formatDuration(callDuration)}
          </div>
        )}
        <div className="flex items-center gap-4">
          {!isCallActive ? (
            <Button onClick={handleStartCall}>
              <Phone className="h-4 w-4 mr-2" />
              Start Call
            </Button>
          ) : (
            <>
              <Button onClick={handleEndCall} variant="destructive">
                <PhoneOff className="h-4 w-4 mr-2" />
                End Call
              </Button>
              <Button onClick={toggleMute} variant="outline">
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button onClick={toggleSpeaker} variant="outline">
                {isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
