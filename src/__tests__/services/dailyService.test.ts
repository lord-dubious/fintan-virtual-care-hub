import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dailyService } from '@/lib/services/dailyService';

// Mock Daily.co
vi.mock('@daily-co/daily-js', () => ({
  default: {
    createCallObject: vi.fn(() => ({
      join: vi.fn(),
      leave: vi.fn(),
      setUserName: vi.fn(),
      setLocalAudio: vi.fn(),
      setLocalVideo: vi.fn(),
      destroy: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    })),
  },
}));

describe('DailyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(dailyService).toBeDefined();
  });

  it('should create a call object', () => {
    const callObject = dailyService.createCallObject({
      roomUrl: 'https://example.daily.co/room-name'
    });
    expect(callObject).toBeDefined();
  });

  it('should join a room', async () => {
    const callObject = dailyService.createCallObject({
      roomUrl: 'https://example.daily.co/room-name'
    });
    
    await dailyService.joinRoom('https://example.daily.co/room-name', {
      userName: 'Test User',
      audioOff: true,
      videoOff: true
    });
    
    expect(callObject.setUserName).toHaveBeenCalledWith('Test User');
    expect(callObject.setLocalAudio).toHaveBeenCalledWith(false);
    expect(callObject.setLocalVideo).toHaveBeenCalledWith(false);
    expect(callObject.join).toHaveBeenCalled();
  });

  it('should leave a room', async () => {
    const callObject = dailyService.createCallObject({
      roomUrl: 'https://example.daily.co/room-name'
    });
    
    await dailyService.leaveRoom();
    
    expect(callObject.leave).toHaveBeenCalled();
  });

  it('should destroy a call object', () => {
    const callObject = dailyService.createCallObject({
      roomUrl: 'https://example.daily.co/room-name'
    });
    
    dailyService.destroyCallObject();
    
    expect(callObject.destroy).toHaveBeenCalled();
    expect(dailyService.getCallObject()).toBeNull();
  });

  it('should get the call object', () => {
    const callObject = dailyService.createCallObject({
      roomUrl: 'https://example.daily.co/room-name'
    });
    
    expect(dailyService.getCallObject()).toBe(callObject);
  });
});
