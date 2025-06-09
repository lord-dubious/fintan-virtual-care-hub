
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
    const roomUrl = `https://virtualcare.daily.co/${appointmentId}`;
    const sessionId = `session_${appointmentId}_${Date.now()}`;
    
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
    };

    console.log('Video call session created:', consultation.sessionId);
    return this.currentSession;
  }

  async joinSession(sessionId: string, roomUrl?: string): Promise<boolean> {
    try {
      const room = roomUrl || `https://virtualcare.daily.co/${sessionId}`;
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
