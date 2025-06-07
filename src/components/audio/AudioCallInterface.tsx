
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { audioCallService, AudioCallSession } from '@/services/audioCallService';
import { webrtcService } from '@/services/webrtcService';
import { Mic, MicOff, PhoneOff, Volume2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioCallInterfaceProps {
  session: AudioCallSession;
  onEndCall: () => void;
}

const AudioCallInterface: React.FC<AudioCallInterfaceProps> = ({ session, onEndCall }) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        const success = await audioCallService.joinSession(session.sessionId, session.roomUrl);
        if (success) {
          setIsConnected(true);
          
          // Set up WebRTC event listeners
          webrtcService.onConnect = () => {
            setIsConnected(true);
          };

          webrtcService.onParticipantJoined = (participant) => {
            setParticipants(prev => [...prev, participant]);
          };

          webrtcService.onParticipantLeft = (participant) => {
            setParticipants(prev => prev.filter(p => p.session_id !== participant.session_id));
          };

          webrtcService.onError = (error) => {
            console.error('Audio call error:', error);
          };

          webrtcService.onClose = () => {
            setIsConnected(false);
          };
        }
      } catch (error) {
        console.error('Failed to initialize audio call:', error);
      }
    };

    initializeCall();

    return () => {
      audioCallService.endSession(session.sessionId);
    };
  }, [session.sessionId, session.roomUrl]);

  const handleToggleAudio = async () => {
    const newState = await audioCallService.toggleAudio();
    setIsAudioEnabled(newState);
  };

  const handleEndCall = async () => {
    await audioCallService.endSession(session.sessionId);
    onEndCall();
  };

  const handleToggleChat = () => {
    setShowChat(!showChat);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-medical-primary/10 to-medical-accent/10 dark:from-medical-primary/20 dark:to-medical-accent/20 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-medical-dark-surface shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold dark:text-medical-dark-text-primary">
                Audio Consultation
              </h1>
              <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                with Dr. Fintan Ekochin
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? 'Connected' : 'Connecting...'}
              </Badge>
              <Badge variant="outline">
                {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Audio Status */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                <div className="mb-8">
                  <div className={cn(
                    "w-32 h-32 rounded-full flex items-center justify-center mb-6 transition-all duration-300",
                    isConnected && isAudioEnabled ? 
                      "bg-green-100 dark:bg-green-900/30 animate-pulse" : 
                      "bg-gray-100 dark:bg-gray-800"
                  )}>
                    <Volume2 className={cn(
                      "h-16 w-16",
                      isConnected && isAudioEnabled ? 
                        "text-green-600 dark:text-green-400" : 
                        "text-gray-400 dark:text-gray-600"
                    )} />
                  </div>
                  
                  <h2 className="text-2xl font-semibold mb-2 dark:text-medical-dark-text-primary">
                    {isConnected ? 'Audio Call Active' : 'Connecting...'}
                  </h2>
                  <p className="text-medical-neutral-600 dark:text-medical-dark-text-secondary">
                    {isConnected ? 
                      `High-quality audio consultation in progress` :
                      'Establishing secure connection...'
                    }
                  </p>
                </div>

                {/* Audio Visualization */}
                {isConnected && isAudioEnabled && (
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-medical-primary dark:bg-medical-accent rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 20 + 10}px`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: '1s'
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Call Info */}
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium dark:text-medical-dark-text-primary">Duration</p>
                    <p className="text-lg text-medical-primary dark:text-medical-accent">
                      {isConnected ? '00:00' : '--:--'}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm font-medium dark:text-medical-dark-text-primary">Quality</p>
                    <p className="text-lg text-green-600 dark:text-green-400">
                      {isConnected ? 'HD' : '--'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold dark:text-medical-dark-text-primary">
                    Chat
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleChat}
                    className="p-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Chat messages will appear here during the consultation
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={!isConnected}
                  />
                  <Button size="sm" disabled={!isConnected}>
                    Send
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-medical-dark-surface border-t shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex justify-center gap-6">
            <Button
              variant={isAudioEnabled ? "default" : "destructive"}
              size="lg"
              onClick={handleToggleAudio}
              className="rounded-full w-16 h-16"
            >
              {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>

            <Button
              variant="destructive"
              size="lg"
              onClick={handleEndCall}
              className="rounded-full w-16 h-16"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm text-medical-neutral-600 dark:text-medical-dark-text-secondary">
              {isAudioEnabled ? 'Microphone is on' : 'Microphone is muted'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioCallInterface;
