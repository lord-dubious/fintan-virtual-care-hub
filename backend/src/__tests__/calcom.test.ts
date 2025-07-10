import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../server';
import { prisma } from '../config/database';
import { calcomService } from '../services/calcomService';

// Mock the Cal.com service
jest.mock('../services/calcomService');
const mockCalcomService = calcomService as jest.Mocked<typeof calcomService>;

// Mock data
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'PATIENT',
  calcomUserId: null,
};

const mockCalcomUser = {
  id: 123,
  email: 'test@example.com',
  name: 'Test User',
  username: 'test-user',
  timeZone: 'UTC',
  weekStart: 'Sunday',
  timeFormat: 12,
};

const mockEventType = {
  id: 1,
  title: 'Video Consultation',
  slug: 'video-consultation',
  description: 'Video consultation with Doctor Fintan Ekochin',
  length: 30,
  locations: [{ type: 'integration', integration: 'daily' }],
  requiresConfirmation: false,
  disableGuests: false,
};

const mockBooking = {
  id: 456,
  uid: 'booking-uid-123',
  title: 'Video Consultation',
  description: 'Video consultation with Doctor Fintan Ekochin',
  startTime: '2024-01-15T10:00:00Z',
  endTime: '2024-01-15T10:30:00Z',
  attendees: [{ email: 'test@example.com', name: 'Test User', timeZone: 'UTC' }],
  organizer: { email: 'doctor@example.com', name: 'Doctor Fintan', timeZone: 'UTC' },
  location: 'Daily.co Room',
  status: 'ACCEPTED' as const,
  metadata: { consultationType: 'VIDEO' },
};

describe('Cal.com Integration', () => {
  let authToken: string;

  beforeEach(async () => {
    // Create test user and get auth token
    const user = await prisma.user.create({
      data: mockUser,
    });

    // Mock authentication token
    authToken = 'mock-jwt-token';
    
    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: mockUser.email },
    });
  });

  describe('POST /api/calcom/sync-user', () => {
    it('should sync user to Cal.com successfully', async () => {
      mockCalcomService.syncUserToCalcom.mockResolvedValue(mockCalcomUser);

      const response = await request(app)
        .post('/api/calcom/sync-user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.calcomUserId).toBe(mockCalcomUser.id);
      expect(mockCalcomService.syncUserToCalcom).toHaveBeenCalledWith(mockUser.id);
    });

    it('should handle sync errors', async () => {
      mockCalcomService.syncUserToCalcom.mockRejectedValue(new Error('Cal.com API error'));

      const response = await request(app)
        .post('/api/calcom/sync-user')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to sync user to Cal.com');
    });
  });

  describe('GET /api/calcom/event-types', () => {
    it('should get event types successfully', async () => {
      mockCalcomService.getEventTypes.mockResolvedValue([mockEventType]);

      const response = await request(app)
        .get('/api/calcom/event-types')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe(mockEventType.title);
    });
  });

  describe('GET /api/calcom/available-slots', () => {
    it('should get available slots successfully', async () => {
      const mockSlots = [
        { time: '10:00', available: true },
        { time: '10:30', available: true },
        { time: '11:00', available: false },
      ];

      mockCalcomService.getAvailableSlots.mockResolvedValue(mockSlots);

      const response = await request(app)
        .get('/api/calcom/available-slots')
        .query({
          eventTypeId: '1',
          startDate: '2024-01-15T00:00:00Z',
          endDate: '2024-01-15T23:59:59Z',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(mockCalcomService.getAvailableSlots).toHaveBeenCalledWith(
        1,
        '2024-01-15T00:00:00Z',
        '2024-01-15T23:59:59Z'
      );
    });

    it('should require all parameters', async () => {
      const response = await request(app)
        .get('/api/calcom/available-slots')
        .query({ eventTypeId: '1' }) // Missing startDate and endDate
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });
  });

  describe('POST /api/calcom/bookings', () => {
    it('should create booking successfully', async () => {
      mockCalcomService.syncUserToCalcom.mockResolvedValue(mockCalcomUser);
      mockCalcomService.createBooking.mockResolvedValue(mockBooking);

      const bookingData = {
        eventTypeId: 1,
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T10:30:00Z',
        consultationType: 'VIDEO',
        notes: 'Test booking',
      };

      const response = await request(app)
        .post('/api/calcom/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(bookingData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.bookingId).toBe(mockBooking.id);
      expect(response.body.data.uid).toBe(mockBooking.uid);
    });

    it('should require patient role', async () => {
      // Update user role to PROVIDER
      await prisma.user.update({
        where: { id: mockUser.id },
        data: { role: 'PROVIDER' },
      });

      const response = await request(app)
        .post('/api/calcom/bookings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          eventTypeId: 1,
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T10:30:00Z',
        })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/calcom/bookings/:bookingId/cancel', () => {
    it('should cancel booking successfully', async () => {
      mockCalcomService.cancelBooking.mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/calcom/bookings/456/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Test cancellation' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockCalcomService.cancelBooking).toHaveBeenCalledWith(456, 'Test cancellation');
    });
  });

  describe('POST /api/calcom/webhooks', () => {
    it('should handle booking created webhook', async () => {
      const webhookPayload = {
        triggerEvent: 'BOOKING_CREATED',
        createdAt: '2024-01-15T10:00:00Z',
        payload: {
          type: 'Video Consultation',
          title: 'Video Consultation',
          description: 'Video consultation with Doctor Fintan Ekochin',
          startTime: '2024-01-15T10:00:00Z',
          endTime: '2024-01-15T10:30:00Z',
          organizer: {
            id: 123,
            name: 'Doctor Fintan',
            email: 'doctor@example.com',
            username: 'doctor-fintan',
            timeZone: 'UTC',
          },
          attendees: [
            {
              email: 'test@example.com',
              name: 'Test User',
              timeZone: 'UTC',
            },
          ],
          location: 'Daily.co Room',
          uid: 'booking-uid-123',
          bookingId: 456,
          eventTypeId: 1,
          status: 'ACCEPTED' as const,
          metadata: { consultationType: 'VIDEO' },
        },
      };

      const response = await request(app)
        .post('/api/calcom/webhooks')
        .send(webhookPayload)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should handle invalid webhook signature', async () => {
      const response = await request(app)
        .post('/api/calcom/webhooks')
        .set('x-cal-signature', 'invalid-signature')
        .send({ triggerEvent: 'BOOKING_CREATED' })
        .expect(401);

      expect(response.body.error).toBe('Invalid signature');
    });
  });

  describe('GET /api/calcom/health', () => {
    it('should check Cal.com service health', async () => {
      mockCalcomService.getEventTypes.mockResolvedValue([mockEventType]);

      const response = await request(app)
        .get('/api/calcom/health')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
    });

    it('should handle unhealthy service', async () => {
      mockCalcomService.getEventTypes.mockRejectedValue(new Error('Service unavailable'));

      const response = await request(app)
        .get('/api/calcom/health')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(503);

      expect(response.body.success).toBe(false);
      expect(response.body.data.status).toBe('unhealthy');
    });
  });
});

describe('Cal.com Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('syncUserToCalcom', () => {
    it('should create new Cal.com user', async () => {
      // Mock Prisma calls
      const mockPrismaUser = {
        ...mockUser,
        patient: null,
        provider: null,
        calcomUserId: null,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockPrismaUser);
      jest.spyOn(prisma.user, 'update').mockResolvedValue({
        ...mockPrismaUser,
        calcomUserId: mockCalcomUser.id,
      });

      // Mock Cal.com API calls
      mockCalcomService.createManagedUser.mockResolvedValue(mockCalcomUser);
      mockCalcomService.syncUserToCalcom.mockRestore();

      const result = await calcomService.syncUserToCalcom(mockUser.id);

      expect(result).toEqual(mockCalcomUser);
      expect(mockCalcomService.createManagedUser).toHaveBeenCalledWith({
        email: mockUser.email,
        name: mockUser.name,
        username: 'test',
        timeZone: 'UTC',
      });
    });

    it('should return existing Cal.com user', async () => {
      const mockPrismaUser = {
        ...mockUser,
        calcomUserId: mockCalcomUser.id,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockPrismaUser);
      mockCalcomService.getManagedUser.mockResolvedValue(mockCalcomUser);
      mockCalcomService.syncUserToCalcom.mockRestore();

      const result = await calcomService.syncUserToCalcom(mockUser.id);

      expect(result).toEqual(mockCalcomUser);
      expect(mockCalcomService.getManagedUser).toHaveBeenCalledWith(mockCalcomUser.id);
    });
  });
});
