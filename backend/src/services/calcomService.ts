import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { calcomApiConfig, getCalcomApiHeaders, eventTypeTemplates } from '@/config/calcom';
import logger from '@/config/logger';
import { prisma } from '@/config/database';

// Cal.com API Types
export interface CalcomUser {
  id: number;
  email: string;
  name: string;
  username: string;
  timeZone: string;
  weekStart: string;
  timeFormat: number;
}

export interface CalcomEventType {
  id: number;
  title: string;
  slug: string;
  description: string;
  length: number;
  locations: Array<{
    type: string;
    integration?: string;
    metadata?: Record<string, any>;
  }>;
  requiresConfirmation: boolean;
  disableGuests: boolean;
}

export interface CalcomBooking {
  id: number;
  uid: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: Array<{
    email: string;
    name: string;
    timeZone: string;
  }>;
  organizer: {
    email: string;
    name: string;
    timeZone: string;
  };
  location: string;
  status: 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED';
  metadata: Record<string, any>;
}

export interface CreateBookingRequest {
  eventTypeId: number;
  start: string;
  end: string;
  attendee: {
    name: string;
    email: string;
    timeZone?: string;
  };
  metadata?: Record<string, any>;
  location?: string;
}

class CalcomService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: calcomApiConfig.baseUrl,
      timeout: calcomApiConfig.timeout,
      headers: getCalcomApiHeaders(),
    });

    // Add request interceptor for logging
    this.apiClient.interceptors.request.use(
      (config) => {
        logger.debug('Cal.com API Request:', {
          method: config.method,
          url: config.url,
          data: config.data,
        });
        return config;
      },
      (error) => {
        logger.error('Cal.com API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.apiClient.interceptors.response.use(
      (response) => {
        logger.debug('Cal.com API Response:', {
          status: response.status,
          data: response.data,
        });
        return response;
      },
      (error) => {
        logger.error('Cal.com API Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  // User Management
  async createManagedUser(userData: {
    email: string;
    name: string;
    username?: string;
    timeZone?: string;
  }): Promise<CalcomUser> {
    try {
      const response = await this.apiClient.post('/platform-managed-users/create-a-managed-user', {
        email: userData.email,
        name: userData.name,
        username: userData.username || userData.email.split('@')[0],
        timeZone: userData.timeZone || 'UTC',
        weekStart: 'Sunday',
        timeFormat: 12,
      }, {
        headers: getCalcomApiHeaders(true), // Use OAuth for managed users
      });

      return response.data.data;
    } catch (error) {
      logger.error('Failed to create Cal.com managed user:', error);
      throw new Error('Failed to create Cal.com user');
    }
  }

  async getManagedUser(userId: number): Promise<CalcomUser> {
    try {
      const response = await this.apiClient.get(`/platform-managed-users/${userId}`, {
        headers: getCalcomApiHeaders(true),
      });

      return response.data.data;
    } catch (error) {
      logger.error('Failed to get Cal.com managed user:', error);
      throw new Error('Failed to get Cal.com user');
    }
  }

  // Event Type Management
  async createEventType(eventTypeData: {
    title: string;
    description: string;
    length: number;
    consultationType: 'VIDEO' | 'AUDIO';
    userId?: number;
  }): Promise<CalcomEventType> {
    try {
      const template = eventTypeData.consultationType === 'AUDIO' 
        ? eventTypeTemplates.audio 
        : eventTypeTemplates.video;

      const response = await this.apiClient.post('/event-types/create-an-event-type', {
        ...template,
        title: eventTypeData.title,
        description: eventTypeData.description,
        length: eventTypeData.length,
      });

      return response.data.data;
    } catch (error) {
      logger.error('Failed to create Cal.com event type:', error);
      throw new Error('Failed to create Cal.com event type');
    }
  }

  async getEventTypes(): Promise<CalcomEventType[]> {
    try {
      const response = await this.apiClient.get('/event-types/get-all-event-types');
      return response.data.data;
    } catch (error) {
      logger.error('Failed to get Cal.com event types:', error);
      throw new Error('Failed to get Cal.com event types');
    }
  }

  // Booking Management
  async createBooking(bookingData: CreateBookingRequest): Promise<CalcomBooking> {
    try {
      const response = await this.apiClient.post('/bookings/create-a-booking', {
        eventTypeId: bookingData.eventTypeId,
        start: bookingData.start,
        end: bookingData.end,
        attendee: bookingData.attendee,
        metadata: bookingData.metadata,
        location: bookingData.location,
      });

      return response.data.data;
    } catch (error) {
      logger.error('Failed to create Cal.com booking:', error);
      throw new Error('Failed to create Cal.com booking');
    }
  }

  async getBooking(bookingId: number): Promise<CalcomBooking> {
    try {
      const response = await this.apiClient.get(`/bookings/${bookingId}`);
      return response.data.data;
    } catch (error) {
      logger.error('Failed to get Cal.com booking:', error);
      throw new Error('Failed to get Cal.com booking');
    }
  }

  async cancelBooking(bookingId: number, reason?: string): Promise<void> {
    try {
      await this.apiClient.post(`/bookings/${bookingId}/cancel`, {
        reason: reason || 'Cancelled by user',
      });
    } catch (error) {
      logger.error('Failed to cancel Cal.com booking:', error);
      throw new Error('Failed to cancel Cal.com booking');
    }
  }

  async rescheduleBooking(bookingId: number, newStart: string, newEnd: string): Promise<CalcomBooking> {
    try {
      const response = await this.apiClient.post(`/bookings/${bookingId}/reschedule`, {
        start: newStart,
        end: newEnd,
      });

      return response.data.data;
    } catch (error) {
      logger.error('Failed to reschedule Cal.com booking:', error);
      throw new Error('Failed to reschedule Cal.com booking');
    }
  }

  // Availability Management
  async getAvailableSlots(eventTypeId: number, startDate: string, endDate: string): Promise<any[]> {
    try {
      const response = await this.apiClient.get('/slots/get-available-time-slots-for-an-event-type', {
        params: {
          eventTypeId,
          startTime: startDate,
          endTime: endDate,
        },
      });

      return response.data.data;
    } catch (error) {
      logger.error('Failed to get Cal.com available slots:', error);
      throw new Error('Failed to get Cal.com available slots');
    }
  }

  // Webhook Management
  async createWebhook(webhookData: {
    subscriberUrl: string;
    eventTriggers: string[];
    secret?: string;
  }): Promise<any> {
    try {
      const response = await this.apiClient.post('/webhooks/create-a-webhook', {
        subscriberUrl: webhookData.subscriberUrl,
        eventTriggers: webhookData.eventTriggers,
        secret: webhookData.secret,
      });

      return response.data.data;
    } catch (error) {
      logger.error('Failed to create Cal.com webhook:', error);
      throw new Error('Failed to create Cal.com webhook');
    }
  }

  // Sync user from our system to Cal.com
  async syncUserToCalcom(userId: string): Promise<CalcomUser> {
    try {
      // Get user from our database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          patient: true,
          provider: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if user already has Cal.com ID
      if (user.calcomUserId) {
        return await this.getManagedUser(user.calcomUserId);
      }

      // Create new Cal.com user
      const calcomUser = await this.createManagedUser({
        email: user.email,
        name: user.name,
        username: user.email.split('@')[0],
        timeZone: user.timezone || 'UTC',
      });

      // Update our user record with Cal.com ID
      await prisma.user.update({
        where: { id: userId },
        data: { calcomUserId: calcomUser.id },
      });

      return calcomUser;
    } catch (error) {
      logger.error('Failed to sync user to Cal.com:', error);
      throw new Error('Failed to sync user to Cal.com');
    }
  }
}

export const calcomService = new CalcomService();
export default calcomService;
