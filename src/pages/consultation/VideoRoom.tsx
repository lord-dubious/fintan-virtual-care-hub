import React from "react";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/authProvider';
import { consultationService } from '@/lib/services/consultationService';
import { webrtcService } from '@/services/webrtcService';
import { ConsultationResponse } from '@/types/consultation';
import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, MessageSquare, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConsultationStatus } from '@prisma/client';

const VideoRoom: React.FC = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const [consultation, setConsultation] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load consultation data
  useEffect(() => {
    const fetchConsultation = async () => {
      if (!consultationId) return;

      setLoading(true);
      try {
        const result = await consultationService.getConsultationById(consultationId) as ConsultationResponse;
        if (result && result.success && result.consultation) {
          setConsultation(result.consultation);

          // Initialize the video call
          try {
            if (result.consultation.roomUrl) {
              await webrtcService.initializeCall(result.consultation.roomUrl);
            } else {
              setError('Room URL is missing');
            }
          } catch (initError) {
            setError('Failed to initialize video call');
          }
        } else {
          setError(result?.message as string || 'Failed to load consultation');
        }
      } catch (err) {
        console.error('Error fetching consultation:', err);
        setError('An error occurred while loading the consultation');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();

    // Clean up the call when component unmounts
    return () => {
      webrtcService.endCall();
    };
  }, [consultationId]);

  // Toggle audio
  const toggleAudio = async () => {
    const result = await webrtcService.toggleAudio();
    if (result) {
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  // Toggle video
  const toggleVideo = async () => {
    const result = await webrtcService.toggleVideo();
    if (result) {
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // Toggle screen sharing
  const toggleScreenSharing = async () => {
    const result = await webrtcService.shareScreen();
    if (result) {
      setIsScreenSharing(!isScreenSharing);
    }
  };

  // End call
  const endCall = async () => {
    await webrtcService.endCall();
    
    // Update consultation status if needed
    if (consultation && (consultation as { status?: string; id?: string }).status === 'IN_PROGRESS') {
      await consultationService.updateConsultationStatus((consultation as { id: string }).id, ConsultationStatus.COMPLETED);
    }
    
    // Navigate back to appointments
    const role = user?.role.toLowerCase();
    navigate(`/${role}/appointments`);
    
    toast({
      title: 'Call Ended',
      description: 'The consultation has ended',
    });
  };

  // Toggle chat
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Video container */}
      <div className="flex-1 bg-gray-900 relative" id="video-container">
        {/* Video elements will be inserted here by the Daily.co library */}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full ${!isAudioEnabled ? 'bg-red-500 text-white' : ''}`}
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full ${!isVideoEnabled ? 'bg-red-500 text-white' : ''}`}
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full ${isScreenSharing ? 'bg-green-500 text-white' : ''}`}
            onClick={toggleScreenSharing}
          >
            <MonitorUp className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full ${isChatOpen ? 'bg-blue-500 text-white' : ''}`}
            onClick={toggleChat}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full"
            onClick={endCall}
          >
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Chat sidebar */}
      {isChatOpen && (
        <div className="absolute top-0 right-0 h-full w-80 bg-white shadow-lg z-10">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-medium">Chat</h3>
            <Button variant="ghost" size="icon" onClick={toggleChat}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="p-4">
            {/* Chat messages would go here */}
            <p className="text-gray-500 text-center">Chat functionality coming soon</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoRoom;

