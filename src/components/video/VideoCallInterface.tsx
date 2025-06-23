import React, { useEffect, useState, useRef } from 'react';
import { dailyService } from '@/lib/services/dailyService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Mic, MicOff, Video, VideoOff, ScreenShare, PhoneOff } from 'lucide-react';
import { DailyParticipant } from '@daily-co/daily-js';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface VideoCallInterfaceProps {
  roomUrl: string;
  token: string;
  onCallEnd: () => void;
}

const ParticipantTile: React.FC<{ participant: DailyParticipant }> = ({ participant }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const videoTrack = participant.tracks.video.persistentTrack;
    if (videoRef.current && videoTrack) {
      videoRef.current.srcObject = new MediaStream([videoTrack]);
    }

    const audioTrack = participant.tracks.audio.persistentTrack;
    if (audioRef.current && audioTrack) {
      audioRef.current.srcObject = new MediaStream([audioTrack]);
    }
  }, [participant.tracks.video.persistentTrack, participant.tracks.audio.persistentTrack]);

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className={`w-full h-full object-cover ${participant.video ? '' : 'hidden'}`}
      />
      <audio ref={audioRef} autoPlay playsInline />
      {!participant.video && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
          <span className="text-2xl font-bold text-white">{participant.user_name?.charAt(0) || 'P'}</span>
        </div>
      )}
      <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded">
        {participant.user_name || 'Participant'}
      </div>
    </div>
  );
};

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({ roomUrl, token, onCallEnd }) => {
  const [participants, setParticipants] = useState<Record<string, DailyParticipant>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [incomingVideoRequest, setIncomingVideoRequest] = useState(false);
  const [requestPending, setRequestPending] = useState(false);
  
  const localParticipant = Object.values(participants).find(p => p.local);

  useEffect(() => {
    const callObject = dailyService.getCallObject();
    
    const handleParticipantsChange = () => {
        if (!callObject) return;
        setParticipants(callObject.participants());
    };

    const setupCall = async () => {
      try {
        await dailyService.initializeCall(roomUrl, token);
        const co = dailyService.getCallObject();
        if (co) {
          setParticipants(co.participants());
          co.on('participant-joined', handleParticipantsChange);
          co.on('participant-updated', handleParticipantsChange);
          co.on('participant-left', handleParticipantsChange);
          co.on('error', (e) => setError(e?.error?.msg ?? 'An unknown error occurred'));
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize Daily.co call:", err);
        setError(err instanceof Error ? err.message : 'Failed to join call');
        setIsLoading(false);
      }
    };

    setupCall();

    // subscribe to video request events
    dailyService.onVideoRequestReceived(() => {
      setIncomingVideoRequest(true);
    });
    dailyService.onVideoRequestResponseReceived((accepted) => {
      setRequestPending(false);
      toast({
        title: 'Video request',
        description: accepted ? 'The participant enabled their video.' : 'The participant declined your request.',
      });
    });

    return () => {
        dailyService.endCall();
        const co = dailyService.getCallObject();
        if (co) {
          co.off('participant-joined', handleParticipantsChange);
          co.off('participant-updated', handleParticipantsChange);
          co.off('participant-left', handleParticipantsChange);
          co.off('error', (e) => setError(e?.error?.msg ?? 'An unknown error occurred'));
        }
    };
  }, [roomUrl, token, toast]);

  const handleEndCall = () => {
    dailyService.endCall().then(() => {
        onCallEnd();
    });
  };

  const handleSendVideoRequest = async () => {
    setRequestPending(true);
    await dailyService.sendVideoRequest();
  };

  const acceptVideoRequest = async (accept: boolean) => {
    setIncomingVideoRequest(false);
    await dailyService.sendVideoRequestResponse(accept);
    if (accept) {
      await dailyService.enableVideo();
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-black/70 text-white">
          <CardContent className="p-6 flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-lg">Connecting to consultation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
     return (
      <div className="h-screen bg-gray-900 flex items-center justify-center">
        <Card className="bg-red-900/50 text-white">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="mb-4">{error}</p>
            <Button onClick={onCallEnd} variant="destructive">Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const remoteParticipants = Object.values(participants).filter(p => !p.local);

  return (
    <div className="h-screen bg-gray-900 flex flex-col p-4 gap-4">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
         {remoteParticipants.map((p) => (
          <ParticipantTile key={p.session_id} participant={p} />
        ))}
      </div>

       {localParticipant && (
        <div className="w-48 h-36 absolute bottom-20 right-4 rounded-lg overflow-hidden border-2 border-blue-500">
           <ParticipantTile participant={localParticipant} />
        </div>
      )}

      <div className="bg-black/50 rounded-lg p-2 flex justify-center items-center gap-4">
        <Button onClick={() => dailyService.toggleAudio()} variant="ghost" size="icon" className="text-white">
            {localParticipant?.audio ? <Mic size={24} /> : <MicOff size={24} className="text-red-500" />}
        </Button>
        <Button onClick={() => dailyService.toggleVideo()} variant="ghost" size="icon" className="text-white">
            {localParticipant?.video ? <Video size={24} /> : <VideoOff size={24} className="text-red-500" />}
        </Button>
        <Button onClick={() => dailyService.toggleScreenShare()} variant="ghost" size="icon" className="text-white">
          <ScreenShare size={24} />
        </Button>
        {/* Video request button displayed when no remote video active */}
        {remoteParticipants.length > 0 && !remoteParticipants.some(p => p.video) && (
          <Button onClick={handleSendVideoRequest} variant="secondary" disabled={requestPending}>
            {requestPending ? 'Request Sent' : 'Request Video'}
          </Button>
        )}
        <Button onClick={handleEndCall} variant="destructive" size="icon">
          <PhoneOff size={24} />
        </Button>
      </div>

      {/* Incoming video request dialog */}
      <Dialog open={incomingVideoRequest} onOpenChange={setIncomingVideoRequest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Participant requests you to enable your video</DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex gap-4">
            <Button onClick={() => acceptVideoRequest(false)} variant="secondary">Decline</Button>
            <Button onClick={() => acceptVideoRequest(true)}>Enable Video</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoCallInterface;
