import { PrismaClient, Consultation, ConsultationStatus } from '@prisma/client';
import { webrtcService } from './webrtcService';

const prisma = new PrismaClient();

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
      const roomUrl = `https://virtualcare.daily.co/${appointmentId}`;
      const sessionId = `session_${appointmentId}_${Date.now()}`;
      
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
    };

    console.log('Video call session created:', consultation.sessionId);
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

      await webrtcService.initializeCall(room);
      return true;
    } catch (error) {
      console.error('Failed to join session:', error);
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

