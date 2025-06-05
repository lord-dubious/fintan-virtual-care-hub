
import { webrtcService } from './webrtcService';

export interface VideoCallSession {
  sessionId: string;
  roomId: string;
  isActive: boolean;
  participants: string[];
  createdAt: Date;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  sessionId: string;
  data: any;
  from: string;
}

class VideoCallService {
  private currentSession: VideoCallSession | null = null;
  private signalingConnection: WebSocket | null = null;
  
  // In a real implementation, this would be your signaling server URL
  private signalingServerUrl = 'wss://your-signaling-server.com';

  async createSession(appointmentId: string): Promise<VideoCallSession> {
    const sessionId = `session_${appointmentId}_${Date.now()}`;
    
    this.currentSession = {
      sessionId,
      roomId: appointmentId,
      isActive: true,
      participants: [],
      createdAt: new Date()
    };

    // Initialize WebRTC
    await webrtcService.initializeMedia({
      video: { width: 1280, height: 720 },
      audio: true
    });

    // Setup signaling
    this.setupSignaling(sessionId);

    // Create peer as initiator
    webrtcService.createPeer(true);
    this.setupWebRTCCallbacks();

    console.log('Video call session created:', sessionId);
    return this.currentSession;
  }

  async joinSession(sessionId: string): Promise<boolean> {
    try {
      // Initialize media
      await webrtcService.initializeMedia({
        video: { width: 1280, height: 720 },
        audio: true
      });

      // Setup signaling
      this.setupSignaling(sessionId);

      // Create peer as non-initiator
      webrtcService.createPeer(false);
      this.setupWebRTCCallbacks();

      // Send join signal
      this.sendSignalingMessage({
        type: 'join',
        sessionId,
        data: { userId: 'current-user' },
        from: 'current-user'
      });

      return true;
    } catch (error) {
      console.error('Failed to join session:', error);
      return false;
    }
  }

  private setupSignaling(sessionId: string) {
    // In a real implementation, connect to your signaling server
    console.log('Setting up signaling for session:', sessionId);
    
    // Mock signaling for demo - in production, use WebSocket connection
    // this.signalingConnection = new WebSocket(`${this.signalingServerUrl}?session=${sessionId}`);
    
    // For now, we'll simulate signaling locally
    this.simulateSignaling();
  }

  private simulateSignaling() {
    // This is a mock implementation for demo purposes
    // In production, implement proper WebSocket signaling
    setTimeout(() => {
      console.log('Simulating signaling connection established');
    }, 1000);
  }

  private setupWebRTCCallbacks() {
    webrtcService.onSignal = (data) => {
      console.log('Sending signal data:', data);
      this.sendSignalingMessage({
        type: data.type === 'offer' ? 'offer' : data.type === 'answer' ? 'answer' : 'ice-candidate',
        sessionId: this.currentSession?.sessionId || '',
        data,
        from: 'current-user'
      });
    };

    webrtcService.onRemoteStream = (stream) => {
      console.log('Remote stream received');
      // Stream will be handled by the VideoCallInterface component
    };

    webrtcService.onConnect = () => {
      console.log('Peer connection established');
    };

    webrtcService.onError = (error) => {
      console.error('WebRTC error:', error);
    };
  }

  private sendSignalingMessage(message: SignalingMessage) {
    if (this.signalingConnection && this.signalingConnection.readyState === WebSocket.OPEN) {
      this.signalingConnection.send(JSON.stringify(message));
    } else {
      // Mock signaling for demo
      console.log('Would send signaling message:', message);
    }
  }

  async endSession(sessionId: string): Promise<void> {
    webrtcService.endCall();
    
    if (this.signalingConnection) {
      this.sendSignalingMessage({
        type: 'leave',
        sessionId,
        data: {},
        from: 'current-user'
      });
      this.signalingConnection.close();
      this.signalingConnection = null;
    }

    this.currentSession = null;
    console.log('Video call session ended:', sessionId);
  }

  async toggleVideo(): Promise<boolean> {
    return await webrtcService.toggleVideo();
  }

  async toggleAudio(): Promise<boolean> {
    return await webrtcService.toggleAudio();
  }

  async shareScreen(): Promise<MediaStream | null> {
    return await webrtcService.shareScreen();
  }

  getLocalStream(): MediaStream | null {
    return webrtcService.getLocalStream();
  }

  getRemoteStream(): MediaStream | null {
    return webrtcService.getRemoteStream();
  }

  getCurrentSession(): VideoCallSession | null {
    return this.currentSession;
  }
}

export const videoCallService = new VideoCallService();
