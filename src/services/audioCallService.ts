
import { webrtcService } from './webrtcService';

export interface AudioCallSession {
  sessionId: string;
  roomUrl: string;
  isActive: boolean;
  participants: string[];
  createdAt: Date;
  type: 'audio-only';
}

class AudioCallService {
  private currentSession: AudioCallSession | null = null;
  
  async createSession(appointmentId: string): Promise<AudioCallSession> {
    // Create Daily.co room for audio-only consultation
    const roomUrl = `https://ekochin-health.daily.co/audio-${appointmentId}`;
    const sessionId = `audio_session_${appointmentId}_${Date.now()}`;
    
    this.currentSession = {
      sessionId,
      roomUrl,
      isActive: true,
      participants: [],
      createdAt: new Date(),
      type: 'audio-only'
    };

    console.log('Audio call session created:', sessionId);
    return this.currentSession;
  }

  async joinSession(sessionId: string, roomUrl?: string): Promise<boolean> {
    try {
      const room = roomUrl || this.currentSession?.roomUrl;
      if (!room) {
        throw new Error('No room URL available');
      }

      // Initialize with audio-only settings
      await webrtcService.initializeCall(room, undefined, { video: false, audio: true });
      return true;
    } catch (error) {
      console.error('Failed to join audio session:', error);
      return false;
    }
  }

  async endSession(sessionId: string): Promise<void> {
    await webrtcService.endCall();
    this.currentSession = null;
    console.log('Audio call session ended:', sessionId);
  }

  async toggleAudio(): Promise<boolean> {
    return await webrtcService.toggleAudio();
  }

  getCallObject(): any {
    return webrtcService.getCallObject();
  }

  getCurrentSession(): AudioCallSession | null {
    return this.currentSession;
  }
}

export const audioCallService = new AudioCallService();
