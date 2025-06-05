
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { videoCallService, VideoCallSession } from '@/services/videoCallService';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor } from 'lucide-react';

interface VideoCallInterfaceProps {
  session: VideoCallSession;
  onEndCall: () => void;
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({ session, onEndCall }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeCall = async () => {
      const success = await videoCallService.joinSession(session.sessionId);
      if (success) {
        setIsConnected(true);
        
        // Set local video stream
        const localStream = videoCallService.getLocalStream();
        if (localVideoRef.current && localStream) {
          localVideoRef.current.srcObject = localStream;
        }
      }
    };

    initializeCall();

    return () => {
      videoCallService.endSession(session.sessionId);
    };
  }, [session.sessionId]);

  const handleToggleVideo = async () => {
    await videoCallService.toggleVideo();
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleToggleAudio = async () => {
    await videoCallService.toggleAudio();
    setIsAudioEnabled(!isAudioEnabled);
  };

  const handleEndCall = async () => {
    await videoCallService.endSession(session.sessionId);
    onEndCall();
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Video Area */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local Video - Picture in Picture */}
        <Card className="absolute top-4 right-4 w-48 h-36 overflow-hidden">
          <CardContent className="p-0 h-full">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </CardContent>
        </Card>

        {/* Connection Status */}
        <div className="absolute top-4 left-4">
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
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <Card className="bg-black/50 text-white">
            <CardContent className="p-2">
              <p className="text-sm text-center">
                Consultation with Dr. Fintan Ekochin
              </p>
            </CardContent>
          </Card>
        </div>
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
            variant="outline"
            size="lg"
            className="rounded-full w-14 h-14"
          >
            <Monitor className="h-6 w-6" />
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
