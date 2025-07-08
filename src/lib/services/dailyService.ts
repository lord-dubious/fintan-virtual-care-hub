import DailyIframe, {
  DailyCall,
  DailyEventObjectAppMessage,
  DailyEventObjectFatalError,
  DailyParticipant,
  DailyEventObjectParticipants,
} from '@daily-co/daily-js';
import { logger } from '../utils/monitoring';

type ParticipantState = {
  video: boolean;
  audio: boolean;
  screen: boolean;
};

type ParticipantUpdateCallback = (
  participants: Record<string, ParticipantState>
) => void;
type ErrorCallback = (error: DailyEventObjectFatalError) => void;

class DailyService {
  private callObject: DailyCall | null = null;
  private participants: Record<string, ParticipantState> = {};
  private onParticipantUpdate: ParticipantUpdateCallback | null = null;
  private onError: ErrorCallback | null = null;
  public isAudioEnabled: boolean = true;
  public isVideoEnabled: boolean = true;
  public isScreenSharing: boolean = false;
  private onVideoRequestCb: (() => void) | null = null;
  private onVideoRequestResponseCb: ((accepted: boolean) => void) | null = null;

  private updateParticipant(participant: DailyParticipant) {
    this.participants[participant.session_id] = {
      video: Boolean(participant.video),
      audio: Boolean(participant.audio),
      screen: Boolean(participant.screen),
    };
    if (this.onParticipantUpdate) {
      this.onParticipantUpdate({ ...this.participants });
    }
  }

  private handleParticipantJoined = (event?: {
    participant: DailyParticipant;
  }) => {
    if (event?.participant) {
      this.updateParticipant(event.participant);
    }
  };

  private handleParticipantLeft = (event?: {
    participant: DailyParticipant;
  }) => {
    if (event?.participant) {
      delete this.participants[event.participant.session_id];
      if (this.onParticipantUpdate) {
        this.onParticipantUpdate({ ...this.participants });
      }
    }
  };

  private handleParticipantUpdated = (event?: {
    participant: DailyParticipant;
  }) => {
    if (event?.participant) {
      this.updateParticipant(event.participant);
    }
  };
  
  private handleError = (event?: DailyEventObjectFatalError) => {
    if (event && this.onError) {
        this.onError(event);
    }
  };

  private handleLeftMeeting = () => {
    this.reset();
  };

  private handleAppMessage = (event?: DailyEventObjectAppMessage) => {
    if (!event?.data) return;
    const { data } = event;
    if (data.type === 'video-request' && this.onVideoRequestCb) {
      this.onVideoRequestCb();
    }
    if (data.type === 'video-request-response' && this.onVideoRequestResponseCb) {
      this.onVideoRequestResponseCb(Boolean(data.accepted));
    }
  };
  
  private setupEventListeners() {
    if (!this.callObject) return;

    this.callObject.on('participant-joined', this.handleParticipantJoined);
    this.callObject.on('participant-updated', this.handleParticipantUpdated);
    this.callObject.on('participant-left', this.handleParticipantLeft);
    this.callObject.on('error', this.handleError);
    this.callObject.on('left-meeting', this.handleLeftMeeting);
    this.callObject.on('app-message', this.handleAppMessage);
  }

  private removeEventListeners() {
    if (!this.callObject) return;
    
    this.callObject.off('participant-joined', this.handleParticipantJoined);
    this.callObject.off('participant-updated', this.handleParticipantUpdated);
    this.callObject.off('participant-left', this.handleParticipantLeft);
    this.callObject.off('error', this.handleError);
    this.callObject.off('left-meeting', this.handleLeftMeeting);
    this.callObject.off('app-message', this.handleAppMessage);
  }

  async initializeCall(roomUrl: string, token?: string, options?: { video?: boolean, audio?: boolean }): Promise<boolean> {
    if (this.callObject) {
      await this.endCall();
    }
    
    this.callObject = DailyIframe.createCallObject({
      url: roomUrl,
      token: token,
      dailyConfig: {
        useDevicePreferenceCookies: true,
      },
    });

    this.setupEventListeners();

    try {
      await this.callObject.join({
        url: roomUrl,
        token,
        startVideoOff: !(options?.video ?? true),
        startAudioOff: !(options?.audio ?? true),
        showParticipantsBar: true,
        showLeaveButton: true,
        showFullscreenButton: true,
      });

      // Track initial state
      this.isVideoEnabled = options?.video ?? true;
      this.isAudioEnabled = options?.audio ?? true;

      // If initial options disable media, reflect via SDK
      if (!this.isVideoEnabled) {
        await this.callObject.setLocalVideo(false);
      }
      if (!this.isAudioEnabled) {
        await this.callObject.setLocalAudio(false);
      }

      // Initialize with local participant
      const localParticipant = this.callObject.participants().local;
      if (localParticipant) {
        this.updateParticipant(localParticipant);
      }
      return true;
    } catch (err: unknown) {
      const errorData = err instanceof Error ? { message: err.message, stack: err.stack } : { message: String(err) };
      logger.error('Error initializing Daily call', errorData);
      this.reset();
      return false;
    }
  }

  onParticipantsChange(callback: ParticipantUpdateCallback): void {
    this.onParticipantUpdate = callback;
  }
  
  onErrorOccurred(callback: ErrorCallback): void {
    this.onError = callback;
  }
  
  async toggleAudio(): Promise<boolean> {
    if (!this.callObject) return false;
    try {
      await this.callObject.setLocalAudio(!this.isAudioEnabled);
      this.isAudioEnabled = !this.isAudioEnabled;
      return true;
    } catch (err: unknown) {
      const errorData = err instanceof Error ? { message: err.message, stack: err.stack } : { message: String(err) };
      logger.error('Error toggling audio', errorData);
      return false;
    }
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.callObject) return false;
    try {
      await this.callObject.setLocalVideo(!this.isVideoEnabled);
      this.isVideoEnabled = !this.isVideoEnabled;
      return true;
    } catch (err: unknown) {
      const errorData = err instanceof Error ? { message: err.message, stack: err.stack } : { message: String(err) };
      logger.error('Error toggling video', errorData);
      return false;
    }
  }

  async enableVideo(): Promise<boolean> {
    if (!this.callObject) return false;
    try {
      await this.callObject.setLocalVideo(true);
      this.isVideoEnabled = true;
      return true;
    } catch (err: unknown) {
      const errorData = err instanceof Error ? { message: err.message, stack: err.stack } : { message: String(err) };
      logger.error('Error enabling video', errorData);
      return false;
    }
  }

  async shareScreen(): Promise<boolean> {
    if (!this.callObject) return false;
    try {
      const { local } = this.callObject.participants();
      const isCurrentlySharing = Boolean(local?.screen);
      if (isCurrentlySharing) {
        await this.callObject.stopScreenShare();
      } else {
        await this.callObject.startScreenShare();
      }
      this.isScreenSharing = !isCurrentlySharing;
      return true;
    } catch (err: unknown) {
      const errorData = err instanceof Error ? { message: err.message, stack: err.stack } : { message: String(err) };
      logger.error('Error toggling screen share', errorData);
      return false;
    }
  }

  // Backwards compatibility alias
  async toggleScreenShare(): Promise<boolean> {
    return this.shareScreen();
  }

  async sendVideoRequest(): Promise<boolean> {
    if (!this.callObject) return false;
    try {
      await this.callObject.sendAppMessage({ type: 'video-request' }, '*');
      return true;
    } catch (err: unknown) {
      const errorData = err instanceof Error ? { message: err.message, stack: err.stack } : { message: String(err) };
      logger.error('Error sending video request', errorData);
      return false;
    }
  }

  async sendVideoRequestResponse(accepted: boolean): Promise<boolean> {
    if (!this.callObject) return false;
    try {
      await this.callObject.sendAppMessage({ type: 'video-request-response', accepted }, '*');
      return true;
    } catch (err: unknown) {
      const errorData = err instanceof Error ? { message: err.message, stack: err.stack } : { message: String(err) };
      logger.error('Error sending video request response', errorData);
      return false;
    }
  }

  onVideoRequestReceived(callback: () => void): void {
    this.onVideoRequestCb = callback;
  }

  onVideoRequestResponseReceived(callback: (accepted: boolean) => void): void {
    this.onVideoRequestResponseCb = callback;
  }
  
  private reset() {
    this.removeEventListeners();
    this.callObject = null;
    this.participants = {};
    if (this.onParticipantUpdate) {
      this.onParticipantUpdate({});
    }
  }

  async endCall(): Promise<void> {
    if (this.callObject) {
      try {
        await this.callObject.leave();
        await this.callObject.destroy();
      } catch (err: unknown) {
        const errorData = err instanceof Error ? { message: err.message, stack: err.stack } : { message: String(err) };
        logger.error('Error ending call', errorData);
      } finally {
        this.reset();
      }
    }
  }
  
  destroyCall(): void {
    if (this.callObject) {
        this.callObject.destroy();
        this.reset();
    }
  }

  getCallObject(): DailyCall | null {
    return this.callObject;
  }
  
  getParticipants(): Record<string, ParticipantState> {
    return { ...this.participants };
  }
}

export const dailyService = new DailyService();
