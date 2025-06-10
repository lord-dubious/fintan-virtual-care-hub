
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { dailyService } from '../../lib/services/dailyService';

// Mock Daily.co
vi.mock('@daily-co/daily-js', () => ({
  default: {
    createCallObject: vi.fn(() => ({
      join: vi.fn().mockResolvedValue(true),
      leave: vi.fn().mockResolvedValue(true),
      destroy: vi.fn(),
      setLocalAudio: vi.fn(),
      setLocalVideo: vi.fn(),
      localAudio: vi.fn().mockReturnValue(true),
      localVideo: vi.fn().mockReturnValue(true),
      startScreenShare: vi.fn(),
    })),
  },
}));

describe('DailyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initializeCall', () => {
    it('should initialize a call successfully', async () => {
      const roomUrl = 'https://test.daily.co/room';
      const token = 'test-token';
      
      const result = await dailyService.initializeCall(roomUrl, token);
      
      expect(result).toBe(true);
    });

    it('should handle initialization errors', async () => {
      const roomUrl = 'invalid-url';
      const token = 'invalid-token';
      
      const result = await dailyService.initializeCall(roomUrl, token);
      
      expect(result).toBe(false);
    });
  });

  describe('toggleAudio', () => {
    it('should toggle audio successfully', async () => {
      await dailyService.initializeCall('https://test.daily.co/room', 'test-token');
      
      const result = await dailyService.toggleAudio();
      
      expect(result).toBe(true);
    });
  });

  describe('endCall', () => {
    it('should end call successfully', async () => {
      await dailyService.initializeCall('https://test.daily.co/room', 'test-token');
      
      await expect(dailyService.endCall()).resolves.not.toThrow();
    });
  });

  describe('toggleVideo', () => {
    it('should toggle video successfully', async () => {
      await dailyService.initializeCall('https://test.daily.co/room', 'test-token');
      
      const result = await dailyService.toggleVideo();
      
      expect(result).toBe(true);
    });
  });
});
