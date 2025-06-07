
import DailyIframe from '@daily-co/daily-js';

export interface WebRTCConfig {
  roomUrl?: string;
  token?: string;
}

export interface MediaConstraints {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

class WebRTCService {
  private callObject: any = null;
  private localVideo: HTMLVideoElement | null = null;
  private remoteVideo: HTMLVideoElement | null = null;
  
  async initializeCall(
    roomUrl: string, 
    token?: string, 
    mediaConstraints: MediaConstraints = { video: true, audio: true }
  ): Promise<any> {
    try {
      // Create call object with media constraints
      this.callObject = DailyIframe.createCallObject({
        url: roomUrl,
        token: token,
      });

      // Set up event listeners
      this.setupEventListeners();

      // Join the call with specified media settings
      await this.callObject.join({
        video: mediaConstraints.video,
        audio: mediaConstraints.audio
      });
      
      return this.callObject;
    } catch (error) {
      console.error('Failed to initialize Daily.co call:', error);
      throw new Error('Failed to initialize call');
    }
  }

  private setupEventListeners() {
    if (!this.callObject) return;

    this.callObject.on('joined-meeting', () => {
      console.log('Joined meeting successfully');
      this.onConnect?.();
    });

    this.callObject.on('participant-joined', (event: any) => {
      console.log('Participant joined:', event.participant);
      this.onParticipantJoined?.(event.participant);
    });

    this.callObject.on('participant-left', (event: any) => {
      console.log('Participant left:', event.participant);
      this.onParticipantLeft?.(event.participant);
    });

    this.callObject.on('track-started', (event: any) => {
      console.log('Track started:', event);
      if (event.participant.local) {
        this.onLocalStream?.(event.track);
      } else {
        this.onRemoteStream?.(event.track);
      }
    });

    this.callObject.on('error', (error: any) => {
      console.error('Daily.co error:', error);
      this.onError?.(error);
    });

    this.callObject.on('left-meeting', () => {
      console.log('Left meeting');
      this.onClose?.();
    });
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.callObject) return false;
    
    try {
      const currentState = this.callObject.localVideo();
      await this.callObject.setLocalVideo(!currentState);
      return !currentState;
    } catch (error) {
      console.error('Failed to toggle video:', error);
      return false;
    }
  }

  async toggleAudio(): Promise<boolean> {
    if (!this.callObject) return false;
    
    try {
      const currentState = this.callObject.localAudio();
      await this.callObject.setLocalAudio(!currentState);
      return !currentState;
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      return false;
    }
  }

  async shareScreen(): Promise<boolean> {
    if (!this.callObject) return false;
    
    try {
      await this.callObject.startScreenShare();
      return true;
    } catch (error) {
      console.error('Failed to share screen:', error);
      return false;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.callObject) return;
    
    try {
      await this.callObject.stopScreenShare();
    } catch (error) {
      console.error('Failed to stop screen share:', error);
    }
  }

  async sendChatMessage(message: string): Promise<void> {
    if (!this.callObject) return;
    
    try {
      await this.callObject.sendAppMessage({ type: 'chat', message, timestamp: Date.now() });
    } catch (error) {
      console.error('Failed to send chat message:', error);
    }
  }

  async endCall(): Promise<void> {
    if (this.callObject) {
      try {
        await this.callObject.leave();
        this.callObject.destroy();
        this.callObject = null;
      } catch (error) {
        console.error('Failed to end call:', error);
      }
    }
  }

  getCallObject(): any {
    return this.callObject;
  }

  // Event callbacks - to be set by the consuming component
  onLocalStream?: (stream: MediaStream) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnect?: () => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
  onParticipantJoined?: (participant: any) => void;
  onParticipantLeft?: (participant: any) => void;
  onChatMessage?: (message: any) => void;
}

export const webrtcService = new WebRTCService();
