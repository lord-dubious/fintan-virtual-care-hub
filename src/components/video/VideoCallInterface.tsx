
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { videoCallService, VideoCallSession } from '@/services/videoCallService';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MonitorSpeaker } from 'lucide-react';

interface VideoCallInterfaceProps {
  session: VideoCallSession;
  onEndCall: () => void;
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({ session, onEndCall }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        const success = await videoCallService.joinSession(session.sessionId, session.roomUrl);
        if (success) {
          setIsConnected(true);
          
          // Get the Daily.co call object and embed it
          const callObject = videoCallService.getCallObject();
          if (callObject && containerRef.current) {
            // Daily.co handles video rendering internally
            console.log('Daily.co call initialized');
          }
        }
      } catch (error) {
        console.error('Failed to initialize call:', error);
      }
    };

    initializeCall();

    return () => {
      videoCallService.endSession(session.sessionId);
    };
  }, [session.sessionId, session.roomUrl]);

  const handleToggleVideo = async () => {
    const newState = await videoCallService.toggleVideo();
    setIsVideoEnabled(newState);
  };

  const handleToggleAudio = async () => {
    const newState = await videoCallService.toggleAudio();
    setIsAudioEnabled(newState);
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      const callObject = videoCallService.getCallObject();
      if (callObject) {
        await callObject.stopScreenShare();
      }
      setIsScreenSharing(false);
    } else {
      const success = await videoCallService.shareScreen();
      setIsScreenSharing(success);
    }
  };

  const handleEndCall = async () => {
    await videoCallService.endSession(session.sessionId);
    onEndCall();
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Video Container - Daily.co will manage this */}
      <div ref={containerRef} className="flex-1 relative bg-gray-800">
        {/* Connection Status */}
        <div className="absolute top-4 left-4 z-10">
          <Card className="bg-black/50 text-white">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">
                  {isConnected ? 'Connected' : 'Connecting...'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Info */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Card className="bg-black/50 text-white">
            <CardContent className="p-2">
              <p className="text-sm text-center">
                Consultation with Dr. Fintan Ekochin
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Placeholder for video when not connected */}
        {!isConnected && (
          <div className="flex items-center justify-center h-full">
            <div className="text-white text-center">
              <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Connecting to video call...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex justify-center gap-4">
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={handleToggleAudio}
            className="rounded-full w-14 h-14"
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={handleToggleVideo}
            className="rounded-full w-14 h-14"
          >
            {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={handleToggleScreenShare}
            className="rounded-full w-14 h-14"
          >
            {isScreenSharing ? <MonitorSpeaker className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full w-14 h-14"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallInterface;
