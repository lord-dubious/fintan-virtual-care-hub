import { config } from '@/config';
import logger from '@/config/logger';

// Daily.co configuration
export const dailyConfig = {
  apiKey: config.daily.apiKey,
  domain: config.daily.domain,
  baseUrl: 'https://api.daily.co/v1',
};

// Daily.co API client
interface DailyRoom {
	id: string;
	name: string;
	url: string;
	exp: number;
	[key: string]: unknown;
}

interface MeetingToken {
	token: string;
	exp: number;
	room_name: string;
	user_name: string;
	is_owner: boolean;
	[key: string]: unknown;
}

class DailyClient {
  private apiKey: string;
  private baseUrl: string;
  private isMockMode: boolean;

  constructor(apiKey: string, baseUrl: string = 'https://api.daily.co/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.isMockMode = !apiKey || apiKey === 'your-daily-api-key-here';
  }

  private async makeRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(`Daily.co API error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      return await response.json() as T;
    } catch (error) {
      logger.error('Daily.co API request failed:', error);
      throw error;
    }
  }

  // Create a new room
  async createRoom(properties: any): Promise<DailyRoom> {
    if (this.isMockMode) {
      // Mock response for development/testing
      const roomId = `mock-room-${Date.now()}`;
      return {
        id: roomId,
        name: properties.name || `mock-room-${Date.now()}`,
        url: `https://mock-domain.daily.co/${properties.name || roomId}`,
        exp: properties.exp || Math.floor(Date.now() / 1000) + 3600,
        created_at: new Date().toISOString(),
        config: properties,
      };
    }

    return this.makeRequest<DailyRoom>('/rooms', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });
  }

  // Get room details
  async getRoom(roomName: string) {
    return this.makeRequest(`/rooms/${roomName}`);
  }

  // Delete a room
  async deleteRoom(roomName: string) {
    return this.makeRequest(`/rooms/${roomName}`, {
      method: 'DELETE',
    });
  }

  // Create a meeting token
  async createMeetingToken(properties: any): Promise<MeetingToken> {
    if (this.isMockMode) {
      // Mock response for development/testing
      return {
        token: `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        exp: properties.exp || Math.floor(Date.now() / 1000) + 3600,
        room_name: properties.room_name,
        user_name: properties.user_name,
        is_owner: properties.is_owner || false,
      };
    }

    return this.makeRequest<MeetingToken>('/meeting-tokens', {
      method: 'POST',
      body: JSON.stringify({ properties }),
    });
  }

  // Get room recordings
  async getRoomRecordings(roomName: string) {
    return this.makeRequest(`/recordings?room_name=${roomName}`);
  }
}

// Initialize Daily.co client
export const dailyClient = new DailyClient(dailyConfig.apiKey || 'mock-api-key');

// Validate Daily.co configuration
export const validateDailyConfig = () => {
  if (!dailyConfig.apiKey) {
    logger.error('DAILY_API_KEY is not configured');
    return false;
  }
  if (!dailyConfig.domain) {
    logger.error('DAILY_DOMAIN is not configured');
    return false;
  }
  return true;
};
