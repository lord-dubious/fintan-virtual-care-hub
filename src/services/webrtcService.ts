
import Peer from 'simple-peer';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export interface MediaConstraints {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

class WebRTCService {
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private peer: Peer.Instance | null = null;
  private isInitiator: boolean = false;
  
  private config: WebRTCConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ]
  };

  async initializeMedia(constraints: MediaConstraints = { video: true, audio: true }): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw new Error('Camera/microphone access denied');
    }
  }

  createPeer(isInitiator: boolean, stream?: MediaStream): Peer.Instance {
    this.isInitiator = isInitiator;
    
    const peerConfig = {
      initiator: isInitiator,
      stream: stream || this.localStream,
      config: this.config,
      trickle: true
    };

    this.peer = new Peer(peerConfig);
    
    this.setupPeerEvents();
    return this.peer;
  }

  private setupPeerEvents() {
    if (!this.peer) return;

    this.peer.on('signal', (data) => {
      console.log('Peer signal:', data);
      // In a real implementation, send this signal data to the remote peer via signaling server
      this.onSignal?.(data);
    });

    this.peer.on('stream', (stream) => {
      console.log('Received remote stream');
      this.remoteStream = stream;
      this.onRemoteStream?.(stream);
    });

    this.peer.on('connect', () => {
      console.log('Peer connected');
      this.onConnect?.();
    });

    this.peer.on('error', (error) => {
      console.error('Peer error:', error);
      this.onError?.(error);
    });

    this.peer.on('close', () => {
      console.log('Peer connection closed');
      this.onClose?.();
    });
  }

  signal(data: any) {
    if (this.peer) {
      this.peer.signal(data);
    }
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  async toggleAudio(): Promise<boolean> {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  async shareScreen(): Promise<MediaStream | null> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      if (this.peer) {
        // Replace video track with screen share
        const sender = this.peer._pc?.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        
        if (sender) {
          await sender.replaceTrack(screenStream.getVideoTracks()[0]);
        }
      }

      return screenStream;
    } catch (error) {
      console.error('Failed to share screen:', error);
      return null;
    }
  }

  endCall() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.remoteStream = null;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  // Event callbacks - to be set by the consuming component
  onSignal?: (data: any) => void;
  onRemoteStream?: (stream: MediaStream) => void;
  onConnect?: () => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export const webrtcService = new WebRTCService();
