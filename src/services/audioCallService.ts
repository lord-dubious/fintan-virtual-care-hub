import { Consultation, ConsultationStatus } from '@/types/prisma';
import { webrtcService } from './webrtcService';

interface StartCallParams {
  consultationId: string;
  patientId: string;
  providerId: string;
}

interface EndCallParams {
  consultationId: string;
}

class AudioCallService {
  async startCall(params: StartCallParams): Promise<{ success: boolean; message?: string }> {
    try {
      // 1. Update consultation status to IN_PROGRESS
      const updateConsultationResult = await this.updateConsultationStatus(
        params.consultationId,
        ConsultationStatus.IN_PROGRESS
      );

      if (!updateConsultationResult.success) {
        return { success: false, message: 'Failed to update consultation status' };
      }

      // 2. Initialize WebRTC connection (assuming webrtcService handles the signaling)
      const webrtcInitializationResult = await webrtcService.initializeConnection(
        params.patientId,
        params.providerId
      );

      if (!webrtcInitializationResult.success) {
        return { success: false, message: 'Failed to initialize WebRTC connection' };
      }

      console.log(`Audio call started for consultation ${params.consultationId}`);
      return { success: true };
    } catch (error) {
      console.error('Error starting audio call:', error);
      return { success: false, message: 'Failed to start audio call' };
    }
  }

  async endCall(params: EndCallParams): Promise<{ success: boolean; message?: string }> {
    try {
      // 1. Update consultation status to COMPLETED
      const updateConsultationResult = await this.updateConsultationStatus(
        params.consultationId,
        ConsultationStatus.COMPLETED
      );

      if (!updateConsultationResult.success) {
        return { success: false, message: 'Failed to update consultation status' };
      }

      // 2. Close WebRTC connection
      webrtcService.closeConnection();

      console.log(`Audio call ended for consultation ${params.consultationId}`);
      return { success: true };
    } catch (error) {
      console.error('Error ending audio call:', error);
      return { success: false, message: 'Failed to end audio call' };
    }
  }

  private async updateConsultationStatus(
    consultationId: string,
    status: ConsultationStatus
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Mock implementation - replace with actual Prisma update
      console.log(`Updating consultation ${consultationId} status to ${status}`);
      return { success: true };
    } catch (error) {
      console.error('Error updating consultation status:', error);
      return { success: false, message: 'Failed to update consultation status' };
    }
  }
}

export const audioCallService = new AudioCallService();
