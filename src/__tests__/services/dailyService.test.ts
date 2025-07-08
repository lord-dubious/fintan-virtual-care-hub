import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import DailyIframe from '@daily-co/daily-js';
import { dailyService } from '../../lib/services/dailyService';

// Mock the DailyIframe module
vi.mock('@daily-co/daily-js', () => {
  const mockCallObject = {
    join: vi.fn().mockResolvedValue({}),
    leave: vi.fn().mockResolvedValue({}),
    destroy: vi.fn(),
    setLocalVideo: vi.fn().mockResolvedValue({}),
    setLocalAudio: vi.fn().mockResolvedValue({}),
    startScreenShare: vi.fn().mockResolvedValue({}),
    stopScreenShare: vi.fn().mockResolvedValue({}),
    sendAppMessage: vi.fn().mockResolvedValue({}),
    on: vi.fn(),
    participants: vi.fn().mockReturnValue({
      local: { screen: false }
    })
  };

  return {
    createCallObject: vi.fn().mockReturnValue(mockCallObject)
  };
});

describe('dailyService', () => {
  let mockCallObject: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Get the mock call object
    mockCallObject = DailyIframe.createCallObject();
  });

  afterEach(() => {
    // Clean up after each test
    dailyService.endCall();
  });

  describe('initializeCall', () => {
    it('should initialize a call with default options', async () => {
      const roomUrl = 'https://example.daily.co/room123';
      const token = 'test-token';
      
      const result = await dailyService.initializeCall(roomUrl, token);
      
      expect(result).toBe(true);
      expect(DailyIframe.createCallObject).toHaveBeenCalledWith({
        url: roomUrl,
        token: token,
        dailyConfig: {
          experimentalChromeVideoMuteLightOff: true,
          useDevicePreferenceCookies: true,
        },
      });
      expect(mockCallObject.join).toHaveBeenCalledWith({
        url: roomUrl,
        token: token,
        showLocalVideo: true,
        showParticipantsBar: true,
        showLeaveButton: true,
        showFullscreenButton: true,
      });
    });

    it('should initialize a call with video disabled', async () => {
      const roomUrl = 'https://example.daily.co/room123';
      const token = 'test-token';
      const options = { video: false, audio: true };
      
      const result = await dailyService.initializeCall(roomUrl, token, options);
      
      expect(result).toBe(true);
      expect(mockCallObject.join).toHaveBeenCalled();
      expect(mockCallObject.setLocalVideo).toHaveBeenCalledWith(false);
    });

    it('should initialize a call with audio disabled', async () => {
      const roomUrl = 'https://example.daily.co/room123';
      const token = 'test-token';
      const options = { video: true, audio: false };
      
      const result = await dailyService.initializeCall(roomUrl, token, options);
      
      expect(result).toBe(true);
      expect(mockCallObject.join).toHaveBeenCalled();
      expect(mockCallObject.setLocalAudio).toHaveBeenCalledWith(false);
    });

    it('should handle errors during initialization', async () => {
      const roomUrl = 'https://example.daily.co/room123';
      const token = 'test-token';
      
      // Mock a failure
      mockCallObject.join.mockRejectedValueOnce(new Error('Failed to join'));
      
      const result = await dailyService.initializeCall(roomUrl, token);
      
      expect(result).toBe(false);
    });
  });

  describe('toggleAudio', () => {
    it('should toggle audio on', async () => {
      // Setup
      await dailyService.initializeCall('https://example.daily.co/room123', 'token');
      
      // Mock current state (audio is off)
      // @ts-expect-error - Accessing private property for testing
      dailyService.isAudioEnabled = false;
      
      // Execute
      const result = await dailyService.toggleAudio();
      
      // Verify
      expect(result).toBe(true);
      expect(mockCallObject.setLocalAudio).toHaveBeenCalledWith(true);
    });

    it('should toggle audio off', async () => {
      // Setup
      await dailyService.initializeCall('https://example.daily.co/room123', 'token');
      
      // Mock current state (audio is on)
      // @ts-expect-error - Accessing private property for testing
      dailyService.isAudioEnabled = true;
      
      // Execute
      const result = await dailyService.toggleAudio();
      
      // Verify
      expect(result).toBe(true);
      expect(mockCallObject.setLocalAudio).toHaveBeenCalledWith(false);
    });

    it('should return false if call object is not initialized', async () => {
      // Force call object to be null
      // @ts-expect-error - Accessing private property for testing
      dailyService.callObject = null;
      
      const result = await dailyService.toggleAudio();
      
      expect(result).toBe(false);
    });
  });

  describe('toggleVideo', () => {
    it('should toggle video on', async () => {
      // Setup
      await dailyService.initializeCall('https://example.daily.co/room123', 'token');
      
      // Mock current state (video is off)
      // @ts-expect-error - Accessing private property for testing
      dailyService.isVideoEnabled = false;
      
      // Execute
      const result = await dailyService.toggleVideo();
      
      // Verify
      expect(result).toBe(true);
      expect(mockCallObject.setLocalVideo).toHaveBeenCalledWith(true);
    });

    it('should toggle video off', async () => {
      // Setup
      await dailyService.initializeCall('https://example.daily.co/room123', 'token');
      
      // Mock current state (video is on)
      // @ts-expect-error - Accessing private property for testing
      dailyService.isVideoEnabled = true;
      
      // Execute
      const result = await dailyService.toggleVideo();
      
      // Verify
      expect(result).toBe(true);
      expect(mockCallObject.setLocalVideo).toHaveBeenCalledWith(false);
    });
  });

  describe('enableVideo', () => {
    it('should enable video', async () => {
      // Setup
      await dailyService.initializeCall('https://example.daily.co/room123', 'token');
      
      // Execute
      const result = await dailyService.enableVideo();
      
      // Verify
      expect(result).toBe(true);
      expect(mockCallObject.setLocalVideo).toHaveBeenCalledWith(true);
    });
  });

  describe('shareScreen', () => {
    it('should start screen sharing when not already sharing', async () => {
      // Setup
      await dailyService.initializeCall('https://example.daily.co/room123', 'token');
      
      // Mock that we're not currently screen sharing
      mockCallObject.participants.mockReturnValue({
        local: { screen: false }
      });
      
      // Execute
      const result = await dailyService.shareScreen();
      
      // Verify
      expect(result).toBe(true);
      expect(mockCallObject.startScreenShare).toHaveBeenCalled();
      expect(mockCallObject.stopScreenShare).not.toHaveBeenCalled();
    });

    it('should stop screen sharing when already sharing', async () => {
      // Setup
      await dailyService.initializeCall('https://example.daily.co/room123', 'token');
      
      // Mock that we're currently screen sharing
      mockCallObject.participants.mockReturnValue({
        local: { screen: true }
      });
      
      // Execute
      const result = await dailyService.shareScreen();
      
      // Verify
      expect(result).toBe(true);
      expect(mockCallObject.stopScreenShare).toHaveBeenCalled();
      expect(mockCallObject.startScreenShare).not.toHaveBeenCalled();
    });
  });

  describe('sendVideoRequest', () => {
    it('should send a video request message', async () => {
      // Setup
      await dailyService.initializeCall('https://example.daily.co/room123', 'token');
      
      // Execute
      const result = await dailyService.sendVideoRequest();
      
      // Verify
      expect(result).toBe(true);
      expect(mockCallObject.sendAppMessage).toHaveBeenCalledWith(
        { type: 'video-request' },
        '*'
      );
    });
  });

  describe('sendVideoRequestResponse', () => {
    it('should send an accepted video request response', async () => {
      // Setup
      await dailyService.initializeCall('https://example.daily.co/room123', 'token');
      
      // Execute
      const result = await dailyService.sendVideoRequestResponse(true);
      
      // Verify
      expect(result).toBe(true);
      expect(mockCallObject.sendAppMessage).toHaveBeenCalledWith(
        { type: 'video-request-response', accepted: true },
        '*'
      );
    });

    it('should send a declined video request response', async () => {
      // Setup
      await dailyService.initializeCall('https://example.daily.co/room123', 'token');
      
      // Execute
      const result = await dailyService.sendVideoRequestResponse(false);
      
      // Verify
      expect(result).toBe(true);
      expect(mockCallObject.sendAppMessage).toHaveBeenCalledWith(
        { type: 'video-request-response', accepted: false },
        '*'
      );
    });
  });

  describe('onVideoRequestReceived', () => {
    it('should register a callback for video requests', async () => {
      // Setup
      await dailyService.initializeCall('https://example.daily.co/room123', 'token');
      const callback = vi.fn();
      
      // Execute
      dailyService.onVideoRequestReceived(callback);
      
      // Verify that the callback was registered
      expect(mockCallObject.on).toHaveBeenCalledWith('app-message', expect.any(Function));
      
      // Simulate receiving a video request message
      const eventHandler = mockCallObject.on.mock.calls[0][1];
      eventHandler({ fromId: 'user123', data: { type: 'video-request' } });
      
      // Verify the callback was called
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('endCall', () => {
    it('should end the call and clean up resources', async () => {
      // Setup
      await dailyService.initializeCall('https://example.daily.co/room123', 'token');
      
      // Execute
      await dailyService.endCall();
      
      // Verify
      expect(mockCallObject.leave).toHaveBeenCalled();
      expect(mockCallObject.destroy).toHaveBeenCalled();
    });

    it('should handle when call object is null', async () => {
      // Force call object to be null
      // @ts-expect-error - Accessing private property for testing
      dailyService.callObject = null;
      
      // This should not throw an error
      await expect(dailyService.endCall()).resolves.not.toThrow();
    });
  });

  describe('getCallObject', () => {
    it('should return the call object', async () => {
      // Setup
      await dailyService.initializeCall('https://example.daily.co/room123', 'token');
      
      // Execute
      const callObject = dailyService.getCallObject();
      
      // Verify
      expect(callObject).toBe(mockCallObject);
    });
  });
});

