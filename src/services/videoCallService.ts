
// Video Call Service for consultation sessions
export interface VideoCallSession {
  sessionId: string;
  participantId: string;
  doctorId: string;
  patientId: string;
  startTime: Date;
  endTime?: Date;
  status: 'waiting' | 'active' | 'ended' | 'failed';
}

export interface VideoCallConfig {
  video: boolean;
  audio: boolean;
  screenShare?: boolean;
  quality: 'low' | 'medium' | 'high';
}

class VideoCallService {
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private isInitialized = false;

  async initializeVideoCall(config: VideoCallConfig): Promise<boolean> {
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: config.video,
        audio: config.audio
      });

      // Initialize peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local stream to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize video call:', error);
      return false;
    }
  }

  async createSession(appointmentId: string): Promise<VideoCallSession> {
    const session: VideoCallSession = {
      sessionId: `session_${Date.now()}`,
      participantId: `participant_${Date.now()}`,
      doctorId: 'dr_fintan',
      patientId: `patient_${Date.now()}`,
      startTime: new Date(),
      status: 'waiting'
    };

    // In a real implementation, this would create a session on your backend
    console.log('Creating video call session:', session);
    
    return session;
  }

  async joinSession(sessionId: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initializeVideoCall({ video: true, audio: true, quality: 'medium' });
      }

      // In a real implementation, this would connect to the session
      console.log('Joining video call session:', sessionId);
      
      return true;
    } catch (error) {
      console.error('Failed to join session:', error);
      return false;
    }
  }

  async endSession(sessionId: string): Promise<void> {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    console.log('Video call session ended:', sessionId);
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  async toggleVideo(): Promise<void> {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }

  async toggleAudio(): Promise<void> {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }
}

export const videoCallService = new VideoCallService();
