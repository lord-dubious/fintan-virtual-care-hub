
import { webrtcService } from './webrtcService';

// Mock types for frontend-only demo
export interface Consultation {
  id: string;
  appointmentId: string;
  sessionId?: string;
  roomUrl?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

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
    // Mock implementation
    const sessionId = `session_${appointmentId}_${Date.now()}`;
    const roomUrl = `https://virtualcare.daily.co/${appointmentId}`;

    this.currentSession = {
      sessionId,
      roomUrl,
      isActive: true,
      participants: [],
      createdAt: new Date(),
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
