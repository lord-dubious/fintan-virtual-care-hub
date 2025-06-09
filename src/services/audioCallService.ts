import { PrismaClient, Consultation, ConsultationStatus } from '@prisma/client';
import { webrtcService } from './webrtcService';

const prisma = new PrismaClient();

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
    // Check if there's already a consultation for this appointment
    const existingConsultation = await prisma.consultation.findUnique({
      where: { appointmentId },
    });

    let consultation: Consultation;

    if (existingConsultation) {
      // Update existing consultation
      consultation = await prisma.consultation.update({
        where: { id: existingConsultation.id },
        data: {
          status: ConsultationStatus.IN_PROGRESS,
          startTime: new Date(),
        },
      });
    } else {
      // Create a new consultation
      const roomUrl = `https://virtualcare.daily.co/audio-${appointmentId}`;
      const sessionId = `audio_session_${appointmentId}_${Date.now()}`;
      
      consultation = await prisma.consultation.create({
        data: {
          appointmentId,
          sessionId,
          roomUrl,
          status: ConsultationStatus.IN_PROGRESS,
          startTime: new Date(),
        },
      });
    }

    // Update appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'IN_PROGRESS',
      },
    });

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
      // Find the consultation by sessionId
      const consultation = !roomUrl ? await prisma.consultation.findFirst({
        where: { sessionId },
      }) : null;

      const room = roomUrl || consultation?.roomUrl;
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
    
    // Update consultation status
    const consultation = await prisma.consultation.findFirst({
      where: { sessionId },
      include: { appointment: true },
    });

    if (consultation) {
      // Update consultation
      await prisma.consultation.update({
        where: { id: consultation.id },
        data: {
          status: ConsultationStatus.COMPLETED,
          endTime: new Date(),
        },
      });

      // Update appointment status
      await prisma.appointment.update({
        where: { id: consultation.appointmentId },
        data: {
          status: 'COMPLETED',
        },
      });
    }

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

