
import DailyIframe from '@daily-co/daily-js';

export interface WebRTCParticipant {
  id: string;
  name?: string;
  audio: boolean;
  video: boolean;
  isLocal: boolean;
}

class WebRTCService {
  private callObject: any = null;
  private isConnected: boolean = false;
  private participants: Map<string, WebRTCParticipant> = new Map();

  // Event handlers
  public onConnect: (() => void) | null = null;
  public onParticipantJoined: ((participant: WebRTCParticipant) => void) | null = null;
  public onParticipantLeft: ((participant: WebRTCParticipant) => void) | null = null;
  public onError: ((error: Error) => void) | null = null;
  public onClose: (() => void) | null = null;

  constructor() {
    this.createCallObject();
  }

  private createCallObject() {
    try {
      this.callObject = DailyIframe.createCallObject({
        audioSource: true,
        videoSource: true,
        dailyConfig: {
          // Removed problematic config
        },
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to create call object:', error);
      if (this.onError) {
        this.onError(error as Error);
      }
    }
  }

  private setupEventListeners() {
    if (!this.callObject) return;

    this.callObject.on('joined-meeting', () => {
      this.isConnected = true;
      if (this.onConnect) {
        this.onConnect();
      }
    });

    this.callObject.on('participant-joined', (event: any) => {
      const participant: WebRTCParticipant = {
        id: event.participant.session_id,
        name: event.participant.user_name,
        audio: !event.participant.audio,
        video: !event.participant.video,
        isLocal: event.participant.local,
      };

      this.participants.set(participant.id, participant);
      if (this.onParticipantJoined) {
        this.onParticipantJoined(participant);
      }
    });

    this.callObject.on('participant-left', (event: any) => {
      const participant = this.participants.get(event.participant.session_id);
      if (participant) {
        this.participants.delete(participant.id);
        if (this.onParticipantLeft) {
          this.onParticipantLeft(participant);
        }
      }
    });

    this.callObject.on('error', (error: any) => {
      console.error('WebRTC error:', error);
      if (this.onError) {
        this.onError(new Error(error.message || 'WebRTC error occurred'));
      }
    });

    this.callObject.on('left-meeting', () => {
      this.isConnected = false;
      this.participants.clear();
      if (this.onClose) {
        this.onClose();
      }
    });
  }

  async joinRoom(roomUrl: string, options: { userName?: string; audioOff?: boolean; videoOff?: boolean } = {}) {
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

      await this.callObject.join({ url: roomUrl });
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }

  async leaveRoom() {
    if (this.callObject && this.isConnected) {
      await this.callObject.leave();
    }
  }

  toggleAudio() {
    if (this.callObject) {
      this.callObject.setLocalAudio(!this.callObject.localAudio());
    }
  }

  toggleVideo() {
    if (this.callObject) {
      this.callObject.setLocalVideo(!this.callObject.localVideo());
    }
  }

  getParticipants(): WebRTCParticipant[] {
    return Array.from(this.participants.values());
  }

  destroy() {
    if (this.callObject) {
      this.callObject.destroy();
      this.callObject = null;
      this.isConnected = false;
      this.participants.clear();
    }
  }
}

export const webrtcService = new WebRTCService();
