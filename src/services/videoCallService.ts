// Frontend Video Call Service
// This service handles video call functionality using Daily.co

import { webrtcService } from './webrtcService';
import { logger } from '../lib/utils/monitoring';
import { apiClient } from '@/api/client';

// Define types for frontend use
interface Consultation {
  id: string;
  appointmentId: string;
  status: ConsultationStatus;
  startedAt?: Date;
  endedAt?: Date;
  sessionId?: string;
  roomUrl?: string;
  createdAt?: Date;
}

enum ConsultationStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
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
  private readonly DAILY_CO_BASE_URL = import.meta.env.VITE_DAILY_CO_BASE_URL || 'https://fintan-virtual-care.daily.co';
  
  async createSession(appointmentId: string): Promise<VideoCallSession> {
    try {
      // Call backend API to create/get consultation session
      const response = await apiClient.post(`/api/consultations/${appointmentId}/session`);
      
      if (!response.success || !response.data) {
        throw new Error('Failed to create video call session');
      }

      const consultation = response.data;

      // Generate Daily.co room URL using environment configuration
      const roomUrl = `${this.DAILY_CO_BASE_URL}/${appointmentId}`;

      this.currentSession = {
        sessionId: consultation.sessionId || `session_${appointmentId}_${Date.now()}`,
        roomUrl: consultation.roomUrl || roomUrl,
        isActive: true,
        participants: [],
        createdAt: new Date(consultation.createdAt || Date.now()),
      };

      logger.info('Video call session created:', { 
        sessionId: this.currentSession.sessionId,
        roomUrl: this.currentSession.roomUrl 
      });
      
      return this.currentSession;
    } catch (error) {
      logger.error('Failed to create video call session:', error);
      
      // Fallback: create session with hardcoded Daily.co URL
      const fallbackRoomUrl = `${this.DAILY_CO_BASE_URL}/${appointmentId}`;
      const fallbackSessionId = `session_${appointmentId}_${Date.now()}`;
      
      this.currentSession = {
        sessionId: fallbackSessionId,
        roomUrl: fallbackRoomUrl,
        isActive: true,
        participants: [],
        createdAt: new Date(),
      };

      logger.info('Created fallback video call session:', { 
        sessionId: fallbackSessionId,
        roomUrl: fallbackRoomUrl 
      });

      return this.currentSession;
    }
  }

  async joinSession(sessionId: string, roomUrl?: string): Promise<boolean> {
    try {
      if (!this.currentSession && roomUrl) {
        this.currentSession = {
          sessionId,
          roomUrl,
          isActive: true,
          participants: [],
          createdAt: new Date(),
        };
      }

      if (!this.currentSession) {
        throw new Error('No active session found');
      }

      // Initialize WebRTC connection with Daily.co
      await webrtcService.initializeConnection(this.currentSession.roomUrl);
      
      logger.info('Joined video call session:', { sessionId });
      return true;
    } catch (error) {
      logger.error('Failed to join video call session:', error);
      return false;
    }
  }

  async endSession(appointmentId: string): Promise<boolean> {
    try {
      if (!this.currentSession) {
        return true; // Already ended
      }

      // Call backend API to end consultation
      try {
        await apiClient.post(`/api/consultations/${appointmentId}/end`);
      } catch (apiError) {
        logger.warn('Failed to notify backend of session end:', apiError);
        // Continue with cleanup even if API call fails
      }

      // Clean up WebRTC connection
      await webrtcService.disconnect();

      this.currentSession = null;
      logger.info('Video call session ended:', { appointmentId });
      return true;
    } catch (error) {
      logger.error('Failed to end video call session:', error);
      return false;
    }
  }

  getCurrentSession(): VideoCallSession | null {
    return this.currentSession;
  }

  async addParticipant(participantId: string): Promise<void> {
    if (this.currentSession) {
      this.currentSession.participants.push(participantId);
      logger.info('Participant added to session:', { participantId });
    }
  }

  async removeParticipant(participantId: string): Promise<void> {
    if (this.currentSession) {
      this.currentSession.participants = this.currentSession.participants.filter(
        id => id !== participantId
      );
      logger.info('Participant removed from session:', { participantId });
    }
  }

  isSessionActive(): boolean {
    return this.currentSession?.isActive || false;
  }

  // Generate Daily.co room URL for appointment
  generateRoomUrl(appointmentId: string): string {
    return `${this.DAILY_CO_BASE_URL}/${appointmentId}`;
  }

  // Get room name from appointment ID
  getRoomName(appointmentId: string): string {
    return appointmentId;
  }

  // Open Daily.co room in new window/tab
  openRoomInNewWindow(appointmentId: string): void {
    const roomUrl = this.generateRoomUrl(appointmentId);
    window.open(roomUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    logger.info('Opened Daily.co room in new window:', { roomUrl });
  }

  // Join room directly (redirect current window)
  joinRoomDirectly(appointmentId: string): void {
    const roomUrl = this.generateRoomUrl(appointmentId);
    window.location.href = roomUrl;
    logger.info('Redirecting to Daily.co room:', { roomUrl });
  }
}

export const videoCallService = new VideoCallService();
