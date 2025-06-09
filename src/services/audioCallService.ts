
import { Consultation } from '@/lib/prisma';
import { webrtcService } from './webrtcService';

const prisma = {
  consultation: {
    findUnique: async () => null,
    findFirst: async () => null,
    create: async (data: any) => ({ id: 'mock-consultation-id', ...data.data }),
    update: async (params: any) => ({ id: params.where.id, ...params.data }),
  },
  appointment: {
    update: async (params: any) => ({ id: params.where.id, ...params.data }),
  },
};

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
    const roomUrl = `https://virtualcare.daily.co/audio-${appointmentId}`;
    const sessionId = `audio_session_${appointmentId}_${Date.now()}`;
    
    const consultation = {
      id: 'mock-consultation-id',
      appointmentId,
      sessionId,
      roomUrl,
      status: 'IN_PROGRESS' as const,
      startTime: new Date(),
      endTime: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.currentSession = {
      sessionId: consultation.sessionId!,
      roomUrl: consultation.roomUrl!,
      isActive: true,
      participants: [],
      createdAt: consultation.createdAt,
      type: 'audio-only'
    };

    console.log('Audio call session created:', consultation.sessionId);
    return this.currentSession;
  }

  async joinSession(sessionId: string, roomUrl?: string): Promise<boolean> {
    try {
      const room = roomUrl || `https://virtualcare.daily.co/audio-${sessionId}`;
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
