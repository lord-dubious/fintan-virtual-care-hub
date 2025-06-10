import DailyIframe from '@daily-co/daily-js';

export interface CallOptions {
  video?: boolean;
  audio?: boolean;
}

class DailyService {
  private callObject: any = null;
  private isInitialized: boolean = false;

  async initializeCall(roomUrl: string, token: string, options?: CallOptions): Promise<boolean> {
    try {
      this.callObject = DailyIframe.createCallObject();
      
      await this.callObject.join({
        url: roomUrl,
        token: token,
        startVideoOff: !options?.video,
        startAudioOff: !options?.audio,
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize call:', error);
      return false;
    }
  }

  async toggleAudio(): Promise<boolean> {
    if (!this.callObject) return false;
    try {
      await this.callObject.setLocalAudio(!this.callObject.localAudio());
      return true;
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      return false;
    }
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.callObject) return false;
    try {
      await this.callObject.setLocalVideo(!this.callObject.localVideo());
      return true;
    } catch (error) {
      console.error('Failed to toggle video:', error);
      return false;
    }
  }

  async enableVideo(): Promise<boolean> {
    if (!this.callObject) return false;
    try {
      await this.callObject.setLocalVideo(true);
      return true;
    } catch (error) {
      console.error('Failed to enable video:', error);
      return false;
    }
  }

  async shareScreen(): Promise<boolean> {
    if (!this.callObject) return false;
    try {
      await this.callObject.startScreenShare();
      return true;
    } catch (error) {
      console.error('Failed to share screen:', error);
      return false;
    }
  }

  async sendVideoRequest(): Promise<boolean> {
    // Mock implementation - would implement actual video request logic
    console.log('Sending video request...');
    return true;
  }

  async sendVideoRequestResponse(accepted: boolean): Promise<boolean> {
    console.log('Video request response:', accepted);
    return true;
  }

  onVideoRequestReceived(callback: () => void): void {
    // Mock implementation - would set up actual event listener
    console.log('Setting up video request listener');
  }

  async endCall(): Promise<void> {
    if (this.callObject) {
      await this.callObject.leave();
      this.callObject.destroy();
      this.callObject = null;
      this.isInitialized = false;
    }
  }

  getCallObject(): any {
    return this.callObject;
  }
}

export const dailyService = new DailyService();
