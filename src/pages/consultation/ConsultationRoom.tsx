import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/authProvider';
import { consultationService } from '@/lib/services/consultationService';
import { dailyService } from '@/lib/services/dailyService';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, MessageSquare, X, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ConsultationRoom: React.FC = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [showVideoConsentPrompt, setShowVideoConsentPrompt] = useState(false);
  const [pendingVideoRequest, setPendingVideoRequest] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load consultation data
  useEffect(() => {
    const fetchConsultation = async () => {
      if (!consultationId || !user) return;

      setLoading(true);
      try {
        const result = await consultationService.getConsultationById(consultationId);
        if (result.success && result.consultation) {
          setConsultation(result.consultation);
          
          // Check if current user is the provider
          setIsProvider(result.consultation.appointment.provider.userId === user.id);
          
          // Set initial video state based on consultation type
          const isVideoCall = result.consultation.appointment.consultationType === 'VIDEO';
          setIsVideoEnabled(isVideoCall);
          
          // Generate secure token for this user
          const token = await consultationService.generateRoomToken(consultationId, user.id);
          
          // Initialize call with Daily.co
          const initResult = await dailyService.initializeCall(
            result.consultation.roomUrl,
            token,
            { 
              video: isVideoCall, // Enable video only for video calls initially
              audio: true // Audio is always enabled
            }
          );
          
          if (!initResult) {
            setError('Failed to initialize call');
          }
          
          // Set up event listeners for video requests
          dailyService.onVideoRequestReceived(() => {
            if (!isProvider) {
              setShowVideoConsentPrompt(true);
            }
          });
          
          // Update consultation status to IN_PROGRESS
          if (result.consultation.status === 'SCHEDULED') {
            await consultationService.updateConsultationStatus(consultationId, 'IN_PROGRESS');
          }
        } else {
          setError(result.message || 'Failed to load consultation');
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
      dailyService.endCall();
    };
  }, [consultationId, user]);

  // Toggle audio
  const toggleAudio = async () => {
    const result = await dailyService.toggleAudio();
    if (result) {
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  // Request video upgrade (for providers in audio calls)
  const requestVideoUpgrade = async () => {
    if (!isProvider || consultation?.appointment.consultationType !== 'AUDIO') {
      return;
    }
    
    // Send video request to patient
    await dailyService.sendVideoRequest();
    setPendingVideoRequest(true);
    
    toast({
      title: 'Video Request Sent',
      description: 'Waiting for patient to accept video...',
    });
  };

  // Accept video request (for patients)
  const acceptVideoRequest = async () => {
    setShowVideoConsentPrompt(false);
    
    const result = await dailyService.enableVideo();
    if (result) {
      setIsVideoEnabled(true);
      
      toast({
        title: 'Video Enabled',
        description: 'You have enabled your camera for this consultation.',
      });
      
      // Update consultation to track that video was enabled
      await consultationService.updateConsultation(consultationId!, {
        videoEnabled: true
      });
    }
  };

  // Decline video request (for patients)
  const declineVideoRequest = () => {
    setShowVideoConsentPrompt(false);
    
    // Notify provider that request was declined
    dailyService.sendVideoRequestResponse(false);
    
    toast({
      title: 'Video Request Declined',
      description: 'You have declined to enable video for this consultation.',
    });
  };

  // Toggle video (for video calls or after consent)
  const toggleVideo = async () => {
    // For audio calls, providers request consent instead of toggling directly
    if (consultation?.appointment.consultationType === 'AUDIO' && isProvider && !isVideoEnabled) {
      requestVideoUpgrade();
      return;
    }
    
    // For patients in audio calls, they can only toggle video if they've already accepted
    if (consultation?.appointment.consultationType === 'AUDIO' && !isProvider && !isVideoEnabled) {
      toast({
        title: 'Video Not Available',
        description: 'This is an audio-only consultation. Your provider may request to enable video if needed.',
        variant: 'destructive',
      });
      return;
    }

    // Normal video toggle for video calls or after consent
    const result = await dailyService.toggleVideo();
    if (result) {
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // Toggle screen sharing
  const toggleScreenSharing = async () => {
    const result = await dailyService.shareScreen();
    if (result) {
      setIsScreenSharing(!isScreenSharing);
    }
  };

  // End call
  const endCall = async () => {
    await dailyService.endCall();
    
    // Update consultation status if needed
    if (consultation && consultation.status === 'IN_PROGRESS') {
      await consultationService.updateConsultationStatus(consultationId!, 'COMPLETED');
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

  const isAudioCall = consultation?.appointment.consultationType === 'AUDIO';
  const otherParticipantName = isProvider 
    ? consultation?.appointment.patient.user.name 
    : consultation?.appointment.provider.user.name;

  // Render different UI based on call type
  return (
    <div className="flex flex-col h-screen">
      {/* Call type indicator */}
      <div className={`px-4 py-2 text-white text-center ${isAudioCall ? 'bg-blue-600' : 'bg-green-600'}`}>
        {isAudioCall ? 'Audio Call' : 'Video Call'} with {otherParticipantName}
      </div>
      
      {/* Main content area - different for audio vs video */}
      {isAudioCall && !isVideoEnabled ? (
        // Audio-only UI
        <div className="flex-1 bg-gray-100 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="bg-blue-100 rounded-full p-8 mx-auto mb-6 w-32 h-32 flex items-center justify-center">
              <Mic className="h-16 w-16 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Audio Call in Progress</h2>
            <p className="text-gray-600 mb-6">Connected with {otherParticipantName}</p>
            
            <div className="flex justify-center space-x-4 mb-6">
              <Button
                variant={isAudioEnabled ? "default" : "destructive"}
                size="lg"
                onClick={toggleAudio}
                className="rounded-full h-16 w-16 flex items-center justify-center"
              >
                {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>
              
              {isProvider && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={requestVideoUpgrade}
                  disabled={pendingVideoRequest}
                  className="rounded-full h-16 w-16 flex items-center justify-center"
                >
                  <Video className="h-6 w-6" />
                </Button>
              )}
              
              <Button
                variant="destructive"
                size="lg"
                onClick={endCall}
                className="rounded-full h-16 w-16 flex items-center justify-center"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              {isProvider 
                ? "You can request to enable video if needed for better diagnosis." 
                : "This is an audio-only consultation. Your provider may request to enable video if needed."}
            </p>
          </div>
        </div>
      ) : (
        // Video UI (either video call or audio call with video enabled)
        <div className="flex-1 bg-gray-900 relative" id="video-container">
          {/* Video elements will be inserted here by the Daily.co library */}
        </div>
      )}

      {/* Controls - different for audio vs video */}
      {isAudioCall && !isVideoEnabled ? (
        // Audio call controls are shown in the main content area
        null
      ) : (
        // Video call controls
        <div className="bg-gray-800 p-4">
          <div className="flex justify-center space-x-4">
            {/* Audio control button */}
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${!isAudioEnabled ? 'bg-red-500 text-white' : ''}`}
              onClick={toggleAudio}
            >
              {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
            
            {/* Video control button */}
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${!isVideoEnabled ? 'bg-red-500 text-white' : ''}`}
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
            
            {/* Screen sharing button */}
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${isScreenSharing ? 'bg-green-500 text-white' : ''}`}
              onClick={toggleScreenSharing}
            >
              <MonitorUp className="h-5 w-5" />
            </Button>
            
            {/* Chat button */}
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${isChatOpen ? 'bg-blue-500 text-white' : ''}`}
              onClick={toggleChat}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            
            {/* End call button */}
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
      )}

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
      
      {/* Video consent prompt dialog */}
      {showVideoConsentPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Enable Video?</h3>
            <p className="mb-6">
              Dr. {consultation?.appointment.provider.user.name} is requesting to enable video for better diagnosis. 
              Do you want to enable your camera?
            </p>
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={declineVideoRequest}>
                Decline
              </Button>
              <Button onClick={acceptVideoRequest}>
                Accept
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationRoom;

