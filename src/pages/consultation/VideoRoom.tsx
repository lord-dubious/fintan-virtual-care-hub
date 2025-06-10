
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/authProvider';
import { consultationService } from '@/lib/services/consultationService';
import { webrtcService } from '@/services/webrtcService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

const VideoRoom: React.FC = () => {
  const { consultationId } = useParams<{ consultationId: string }>();
  const [consultation, setConsultation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsultation = async () => {
      if (!consultationId) return;

      setLoading(true);
      try {
        const result = await consultationService.getConsultationById(consultationId);
        if (result.success && result.consultation) {
          setConsultation(result.consultation);
          
          // Initialize the video call
          await webrtcService.initializeCall(`room-${consultationId}`, {
            video: true,
            audio: true
          });
        } else {
          setError('Consultation not found');
        }
      } catch (err) {
        setError('Failed to load consultation');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultation();
  }, [consultationId]);

  const handleEndCall = async () => {
    await webrtcService.endCall();
    navigate('/dashboard');
  };

  const toggleAudio = async () => {
    const success = await webrtcService.toggleAudio();
    if (success) {
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const toggleVideo = async () => {
    const success = await webrtcService.toggleVideo();
    if (success) {
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-screen">
          {/* Video Area */}
          <div className="bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Video className="h-24 w-24 mx-auto mb-4 text-gray-400" />
              <p>Video Feed</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col justify-between">
            <div className="bg-gray-800 rounded-lg p-6 mb-4">
              <h2 className="text-xl font-semibold mb-4">
                Consultation with Dr. Fintan
              </h2>
              <p className="text-gray-400">
                Consultation ID: {consultationId}
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant={isAudioEnabled ? "default" : "destructive"}
                onClick={toggleAudio}
                className="rounded-full p-4"
              >
                {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </Button>
              
              <Button
                variant={isVideoEnabled ? "default" : "destructive"}
                onClick={toggleVideo}
                className="rounded-full p-4"
              >
                {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </Button>
              
              <Button
                variant="destructive"
                onClick={handleEndCall}
                className="rounded-full p-4"
              >
                <PhoneOff className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoRoom;
