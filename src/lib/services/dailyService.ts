
import DailyIframe from '@daily-co/daily-js';

export interface DailyConfig {
  roomUrl: string;
  userName?: string;
  audioOff?: boolean;
  videoOff?: boolean;
}

export interface DailyCallObject {
  join: () => Promise<void>;
  leave: () => Promise<void>;
  setUserName: (name: string) => void;
  setLocalAudio: (enabled: boolean) => void;
  setLocalVideo: (enabled: boolean) => void;
  destroy: () => void;
  on: (event: string, handler: Function) => void;
  off: (event: string, handler: Function) => void;
}

class DailyService {
  private callObject: DailyCallObject | null = null;

  createCallObject(config: DailyConfig): DailyCallObject {
    try {
      this.callObject = DailyIframe.createCallObject({
        audioSource: true,
        videoSource: true,
        dailyConfig: {
          // Remove the problematic config option
        },
      }) as DailyCallObject;

      return this.callObject;
    } catch (error) {
      console.error('Failed to create call object:', error);
      throw error;
    }
  }

  async joinRoom(roomUrl: string, options: { userName?: string; audioOff?: boolean; videoOff?: boolean } = {}): Promise<void> {
    if (!this.callObject) {
      throw new Error('Call object not initialized');
    }

    try {
      if (options.userName) {
        this.callObject.setUserName(options.userName);
      }

      if (options.audioOff) {
        this.callObject.setLocalAudio(false);
      }

      if (options.videoOff) {
        this.callObject.setLocalVideo(false);
      }

      await this.callObject.join();
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }

  async leaveRoom(): Promise<void> {
    if (!this.callObject) {
      return;
    }

    try {
      await this.callObject.leave();
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  }

  destroyCallObject(): void {
    if (this.callObject) {
      this.callObject.destroy();
      this.callObject = null;
    }
  }

  getCallObject(): DailyCallObject | null {
    return this.callObject;
  }
}

export const dailyService = new DailyService();
