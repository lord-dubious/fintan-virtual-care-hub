
import { webrtcService } from './webrtcService';

export interface VideoCallSession {
  sessionId: string;
  roomUrl: string;
  isActive: boolean;
  participants: string[];
  createdAt: Date;
}

class VideoCallService {
  private currentSession: VideoCallSession | null = null;
  
  async createSession(appointmentId: string): Promise<VideoCallSession> {
    // In a real implementation, you would create a Daily.co room via their API
    // For now, we'll use a demo room URL
    const roomUrl = `https://ekochin-health.daily.co/${appointmentId}`;
    const sessionId = `session_${appointmentId}_${Date.now()}`;
    
    this.currentSession = {
      sessionId,
      roomUrl,
      isActive: true,
      participants: [],
      createdAt: new Date()
    };

    console.log('Video call session created:', sessionId);
    return this.currentSession;
  }

  async joinSession(sessionId: string, roomUrl?: string): Promise<boolean> {
    try {
      const room = roomUrl || this.currentSession?.roomUrl;
      if (!room) {
        throw new Error('No room URL available');
      }

      await webrtcService.initializeCall(room);
      return true;
    } catch (error) {
      console.error('Failed to join session:', error);
      return false;
    }
  }

  async endSession(sessionId: string): Promise<void> {
    await webrtcService.endCall();
    this.currentSession = null;
    console.log('Video call session ended:', sessionId);
  }

  async toggleVideo(): Promise<boolean> {
    return await webrtcService.toggleVideo();
  }

  async toggleAudio(): Promise<boolean> {
    return await webrtcService.toggleAudio();
  }

  async shareScreen(): Promise<boolean> {
    return await webrtcService.shareScreen();
  }

  getCallObject(): any {
    return webrtcService.getCallObject();
  }

  getCurrentSession(): VideoCallSession | null {
    return this.currentSession;
  }
}

export const videoCallService = new VideoCallService();
