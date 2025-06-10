import DailyIframe from '@daily-co/daily-js';

/**
 * Configuration for Daily.co video calls
 * @typedef {Object} DailyConfig
 * @property {string} roomUrl - The Daily.co room URL
 * @property {string} [userName] - Optional user name for the call
 * @property {boolean} [audioOff] - Start with audio muted
 * @property {boolean} [videoOff] - Start with video off
 */
export interface DailyConfig {
  roomUrl: string;
  userName?: string;
  audioOff?: boolean;
  videoOff?: boolean;
}

/**
 * Daily call object interface
 * @typedef {Object} DailyCallObject
 */
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

/**
 * Service class for managing Daily.co video calls
 */
class DailyService {
  private callObject: DailyCallObject | null = null;

  /**
   * Creates a new Daily call object
   * @param {DailyConfig} config - Configuration for the call
   * @returns {DailyCallObject} The created call object
   */
  createCallObject(config: DailyConfig): DailyCallObject {
    try {
      this.callObject = DailyIframe.createCallObject({
        audioSource: true,
        videoSource: true,
        dailyConfig: {
          // Removed problematic config option
        },
      }) as DailyCallObject;

      return this.callObject;
    } catch (error) {
      console.error('Failed to create call object:', error);
      throw error;
    }
  }

  /**
   * Joins a Daily.co room
   * @param {string} roomUrl - The URL of the Daily.co room to join
   * @param {Object} [options] - Optional settings
   * @param {string} [options.userName] - User's name in the call
   * @param {boolean} [options.audioOff] - Start with audio muted
   * @param {boolean} [options.videoOff] - Start with video off
   * @returns {Promise<void>}
   */
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

  /**
   * Leaves the current Daily.co room
   * @returns {Promise<void>}
   */
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

  /**
   * Destroys the Daily call object
   * @returns {void}
   */
  destroyCallObject(): void {
    if (this.callObject) {
      this.callObject.destroy();
      this.callObject = null;
    }
  }

  /**
   * Gets the current Daily call object
   * @returns {DailyCallObject | null}
   */
  getCallObject(): DailyCallObject | null {
    return this.callObject;
  }
}

export const dailyService = new DailyService();
