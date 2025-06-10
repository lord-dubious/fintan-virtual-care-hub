import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Phone, PhoneOff, Video } from 'lucide-react';

interface AudioCallInterfaceProps {
  onEndCall: () => void;
}

const AudioCallInterface: React.FC<AudioCallInterfaceProps> = ({ onEndCall }) => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Call</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={toggleMute}>
            {isMuted ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
          <Button variant="destructive" onClick={onEndCall}>
            <PhoneOff className="h-4 w-4 mr-2" />
            End Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioCallInterface;
