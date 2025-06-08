import DailyIframe from '@daily-co/daily-js';

class DailyService {
  private callObject: any = null;
  private isVideoEnabled: boolean = true;
  private isAudioEnabled: boolean = true;
  private videoRequestCallback: (() => void) | null = null;

  // Initialize a call
  async initializeCall(roomUrl: string, token?: string, options?: { video?: boolean, audio?: boolean }): Promise<boolean> {
    try {
      // Clean up any existing call
      if (this.callObject) {
        await this.endCall();
      }

      // Set default options
      const videoEnabled = options?.video !== undefined ? options.video : true;
      const audioEnabled = options?.audio !== undefined ? options.audio : true;

      // Create a new call object
      this.callObject = DailyIframe.createCallObject({
        url: roomUrl,
        token: token,
        dailyConfig: {
          experimentalChromeVideoMuteLightOff: true,
          useDevicePreferenceCookies: true,
        },
      });

      // Set initial device states
      this.isVideoEnabled = videoEnabled;
      this.isAudioEnabled = audioEnabled;

      // Join the call
      await this.callObject.join({
        url: roomUrl,
        token: token,
        showLocalVideo: videoEnabled,
        showParticipantsBar: true,
        showLeaveButton: true,
        showFullscreenButton: true,
      });

      // Set initial device states
      if (!videoEnabled) {
        await this.callObject.setLocalVideo(false);
      }
      
      if (!audioEnabled) {
        await this.callObject.setLocalAudio(false);
      }

      // Set up event listeners for custom messages
      this.callObject.on('app-message', (event: any) => {
        const { fromId, data } = event;
        
        // Handle video request message
        if (data.type === 'video-request' && this.videoRequestCallback) {
          this.videoRequestCallback();
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize call:', error);
      this.callObject = null;
      return false;
    }
  }

  // Set callback for video request
  onVideoRequestReceived(callback: () => void): void {
    this.videoRequestCallback = callback;
  }

  // Send video request (from provider to patient)
  async sendVideoRequest(): Promise<boolean> {
    if (!this.callObject) return false;
    
    try {
      await this.callObject.sendAppMessage(
        { type: 'video-request' },
        '*' // Send to all participants
      );
      return true;
    } catch (error) {
      console.error('Error sending video request:', error);
      return false;
    }
  }

  // Send response to video request
  async sendVideoRequestResponse(accepted: boolean): Promise<boolean> {
    if (!this.callObject) return false;
    
    try {
      await this.callObject.sendAppMessage(
        { 
          type: 'video-request-response',
          accepted 
        },
        '*' // Send to all participants
      );
      return true;
    } catch (error) {
      console.error('Error sending video request response:', error);
      return false;
    }
  }

  // Enable video
  async enableVideo(): Promise<boolean> {
    if (!this.callObject) return false;
    
    try {
      await this.callObject.setLocalVideo(true);
      this.isVideoEnabled = true;
      return true;
    } catch (error) {
      console.error('Error enabling video:', error);
      return false;
    }
  }

  // Toggle audio
  async toggleAudio(): Promise<boolean> {
    if (!this.callObject) return false;
    
    try {
      const newState = !this.isAudioEnabled;
      await this.callObject.setLocalAudio(newState);
      this.isAudioEnabled = newState;
      return true;
    } catch (error) {
      console.error('Error toggling audio:', error);
      return false;
    }
  }

  // Toggle video
  async toggleVideo(): Promise<boolean> {
    if (!this.callObject) return false;
    
    try {
      const newState = !this.isVideoEnabled;
      await this.callObject.setLocalVideo(newState);
      this.isVideoEnabled = newState;
      return true;
    } catch (error) {
      console.error('Error toggling video:', error);
      return false;
    }
  }

  // Share screen
  async shareScreen(): Promise<boolean> {
    if (!this.callObject) return false;
    
    try {
      if (this.callObject.participants().local.screen) {
        // Stop screen sharing
        await this.callObject.stopScreenShare();
      } else {
        // Start screen sharing
        await this.callObject.startScreenShare();
      }
      return true;
    } catch (error) {
      console.error('Error sharing screen:', error);
      return false;
    }
  }

  // End call
  async endCall(): Promise<void> {
    if (this.callObject) {
      try {
        await this.callObject.leave();
        this.callObject.destroy();
        this.callObject = null;
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
  }

  // Get call object (for advanced usage)
  getCallObject(): any {
    return this.callObject;
  }
}

export const dailyService = new DailyService();

