/**
 * WebRTC Service for managing video calls
 * This service handles video call initialization, management, and cleanup
 */
import { logger } from '../lib/utils/monitoring';

export interface WebRTCCallObject {
  sessionId: string;
  roomUrl: string;
  isActive: boolean;
  participants: string[];
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenSharing: boolean;
}

export interface WebRTCRoom {
  id: string;
  url: string;
  sessionId: string;
}

class WebRTCService {
  private callObject: WebRTCCallObject | null = null;
  private isInitialized = false;

  /**
   * Initialize a WebRTC call with the given room URL
   */
  async initializeCall(room: string): Promise<void> {
    try {
      // Generate a session ID from the room URL for tracking
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.callObject = {
        sessionId,
        roomUrl: room,
        isActive: true,
        participants: [],
        videoEnabled: true,
        audioEnabled: true,
        screenSharing: false,
      };
      
      this.isInitialized = true;
      logger.info('WebRTC call initialized for room:', { room });
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to initialize WebRTC call:', errorData);
      throw error;
    }
  }

  /**
   * End the current WebRTC call
   */
  async endCall(): Promise<void> {
    try {
      if (this.callObject) {
        this.callObject.isActive = false;
        this.callObject = null;
      }
      this.isInitialized = false;
      logger.info('WebRTC call ended');
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to end WebRTC call:', errorData);
      throw error;
    }
  }

  /**
   * Toggle video on/off
   */
  async toggleVideo(): Promise<boolean> {
    try {
      if (!this.callObject) {
        throw new Error('No active call to toggle video');
      }
      
      this.callObject.videoEnabled = !this.callObject.videoEnabled;
      logger.info('Video toggled:', { videoEnabled: this.callObject.videoEnabled });
      
      return this.callObject.videoEnabled;
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to toggle video:', errorData);
      throw error;
    }
  }

  /**
   * Toggle audio on/off
   */
  async toggleAudio(): Promise<boolean> {
    try {
      if (!this.callObject) {
        throw new Error('No active call to toggle audio');
      }
      
      this.callObject.audioEnabled = !this.callObject.audioEnabled;
      logger.info('Audio toggled:', { audioEnabled: this.callObject.audioEnabled });
      
      return this.callObject.audioEnabled;
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to toggle audio:', errorData);
      throw error;
    }
  }

  /**
   * Start screen sharing
   */
  async shareScreen(): Promise<boolean> {
    try {
      if (!this.callObject) {
        throw new Error('No active call to share screen');
      }
      
      this.callObject.screenSharing = !this.callObject.screenSharing;
      logger.info('Screen sharing toggled:', { screenSharing: this.callObject.screenSharing });
      
      return this.callObject.screenSharing;
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to toggle screen sharing:', errorData);
      throw error;
    }
  }

  /**
   * Get the current call object
   */
  getCallObject(): WebRTCCallObject | null {
    return this.callObject;
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService();
