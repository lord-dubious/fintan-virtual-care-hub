import DailyIframe from '@daily-co/daily-js';

class WebRTCService {
  private callObject: any = null;
  private isVideoEnabled: boolean = true;
  private isAudioEnabled: boolean = true;
  private isScreenSharing: boolean = false;

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

      console.log('Successfully joined call:', roomUrl);
      return true;
    } catch (error) {
      console.error('Failed to initialize call:', error);
      this.callObject = null;
      return false;
    }
  }

  async endCall(): Promise<void> {
    if (this.callObject) {
      try {
        // Stop screen sharing if active
        if (this.isScreenSharing) {
          await this.callObject.stopScreenShare();
          this.isScreenSharing = false;
        }
        
        // Leave the call
        await this.callObject.leave();
        
        // Clean up
        this.callObject.destroy();
        this.callObject = null;
        
        console.log('Call ended successfully');
      } catch (error) {
        console.error('Error ending call:', error);
        // Force cleanup even if there was an error
        this.callObject = null;
      }
    }
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.callObject) {
      console.error('No active call');
      return false;
    }

    try {
      this.isVideoEnabled = !this.isVideoEnabled;
      await this.callObject.setLocalVideo(this.isVideoEnabled);
      console.log('Video toggled:', this.isVideoEnabled);
      return true;
    } catch (error) {
      console.error('Error toggling video:', error);
      return false;
    }
  }

  async toggleAudio(): Promise<boolean> {
    if (!this.callObject) {
      console.error('No active call');
      return false;
    }

    try {
      this.isAudioEnabled = !this.isAudioEnabled;
      await this.callObject.setLocalAudio(this.isAudioEnabled);
      console.log('Audio toggled:', this.isAudioEnabled);
      return true;
    } catch (error) {
      console.error('Error toggling audio:', error);
      return false;
    }
  }

  async shareScreen(): Promise<boolean> {
    if (!this.callObject) {
      console.error('No active call');
      return false;
    }

    try {
      if (this.isScreenSharing) {
        await this.callObject.stopScreenShare();
        this.isScreenSharing = false;
      } else {
        await this.callObject.startScreenShare();
        this.isScreenSharing = true;
      }
      console.log('Screen sharing toggled:', this.isScreenSharing);
      return true;
    } catch (error) {
      console.error('Error toggling screen share:', error);
      return false;
    }
  }

  getCallObject(): any {
    return this.callObject;
  }

  isCallActive(): boolean {
    return this.callObject !== null;
  }

  getParticipants(): any[] {
    if (!this.callObject) {
      return [];
    }
    
    const participantsObject = this.callObject.participants();
    return Object.values(participantsObject);
  }
}

export const webrtcService = new WebRTCService();

