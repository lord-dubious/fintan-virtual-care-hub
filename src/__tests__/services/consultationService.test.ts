import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { consultationService } from '../../lib/services/consultationService';
import { PrismaClient } from '@prisma/client';

// Mock the PrismaClient
vi.mock('@prisma/client', () => {
  const mockPrismaClient = {
    consultation: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn()
    },
    appointment: {
      findUnique: vi.fn()
    },
    $connect: vi.fn(),
    $disconnect: vi.fn()
  };

  return {
    PrismaClient: vi.fn(() => mockPrismaClient)
  };
});

// Mock fetch for Daily.co API calls
global.fetch = vi.fn();

describe('consultationService', () => {
  let mockPrisma: any;
  
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    
    // Get the mock Prisma client
    mockPrisma = new PrismaClient();
    
    // Mock fetch response
    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve({ url: 'https://example.daily.co/room123', token: 'test-token' })
    });
  });

  describe('getConsultationById', () => {
    it('should return a consultation when found', async () => {
      // Mock data
      const mockConsultation = {
        id: 'consultation-123',
        appointmentId: 'appointment-123',
        roomUrl: 'https://example.daily.co/room123',
        status: 'SCHEDULED',
        appointment: {
          patient: { user: { name: 'John Doe' } },
          provider: { user: { name: 'Dr. Smith' } }
        }
      };
      
      // Setup mock
      mockPrisma.consultation.findUnique.mockResolvedValue(mockConsultation);
      
      // Execute
      const result = await consultationService.getConsultationById('consultation-123');
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.consultation).toEqual(mockConsultation);
      expect(mockPrisma.consultation.findUnique).toHaveBeenCalledWith({
        where: { id: 'consultation-123' },
        include: expect.any(Object)
      });
    });

    it('should return error when consultation not found', async () => {
      // Setup mock
      mockPrisma.consultation.findUnique.mockResolvedValue(null);
      
      // Execute
      const result = await consultationService.getConsultationById('non-existent-id');
      
      // Verify
      expect(result.success).toBe(false);
      expect(result.message).toBe('Consultation not found');
    });

    it('should handle errors', async () => {
      // Setup mock
      mockPrisma.consultation.findUnique.mockRejectedValue(new Error('Database error'));
      
      // Execute
      const result = await consultationService.getConsultationById('consultation-123');
      
      // Verify
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to fetch consultation');
    });
  });

  describe('getConsultationByAppointmentId', () => {
    it('should return a consultation when found', async () => {
      // Mock data
      const mockConsultation = {
        id: 'consultation-123',
        appointmentId: 'appointment-123',
        roomUrl: 'https://example.daily.co/room123',
        status: 'SCHEDULED'
      };
      
      // Setup mock
      mockPrisma.consultation.findFirst.mockResolvedValue(mockConsultation);
      
      // Execute
      const result = await consultationService.getConsultationByAppointmentId('appointment-123');
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.consultation).toEqual(mockConsultation);
      expect(mockPrisma.consultation.findFirst).toHaveBeenCalledWith({
        where: { appointmentId: 'appointment-123' },
        include: expect.any(Object)
      });
    });

    it('should return error when consultation not found', async () => {
      // Setup mock
      mockPrisma.consultation.findFirst.mockResolvedValue(null);
      
      // Execute
      const result = await consultationService.getConsultationByAppointmentId('non-existent-id');
      
      // Verify
      expect(result.success).toBe(false);
      expect(result.message).toBe('Consultation not found');
    });
  });

  describe('createConsultationRoom', () => {
    it('should create a Daily.co room', async () => {
      // Mock data
      const mockAppointment = {
        id: 'appointment-123',
        consultationType: 'AUDIO'
      };
      
      // Setup mocks
      mockPrisma.appointment.findUnique.mockResolvedValue(mockAppointment);
      
      // Mock environment variable
      process.env.DAILY_API_KEY = 'test-api-key';
      
      // Execute
      const roomUrl = await consultationService.createConsultationRoom('appointment-123');
      
      // Verify
      expect(roomUrl).toBe('https://example.daily.co/room123');
      expect(global.fetch).toHaveBeenCalledWith('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key',
        },
        body: expect.any(String)
      });
      
      // Verify the request body
      const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(requestBody.properties.start_video_off).toBe(true); // For AUDIO call
    });

    it('should handle appointment not found', async () => {
      // Setup mock
      mockPrisma.appointment.findUnique.mockResolvedValue(null);
      
      // Execute and verify
      await expect(consultationService.createConsultationRoom('non-existent-id'))
        .rejects.toThrow('Appointment not found');
    });
  });

  describe('generateRoomToken', () => {
    it('should generate a token for an authorized user', async () => {
      // Mock data
      const mockConsultation = {
        id: 'consultation-123',
        roomUrl: 'https://example.daily.co/room123',
        appointment: {
          patient: { userId: 'patient-user-id' },
          provider: { userId: 'provider-user-id' }
        }
      };
      
      // Setup mocks
      mockPrisma.consultation.findUnique.mockResolvedValue(mockConsultation);
      
      // Mock environment variable
      process.env.DAILY_API_KEY = 'test-api-key';
      
      // Execute
      const token = await consultationService.generateRoomToken('consultation-123', 'patient-user-id');
      
      // Verify
      expect(token).toBe('test-token');
      expect(global.fetch).toHaveBeenCalledWith('https://api.daily.co/v1/meeting-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key',
        },
        body: expect.any(String)
      });
      
      // Verify the request body
      const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(requestBody.properties.room_name).toBe('room123');
      expect(requestBody.properties.is_owner).toBe(false); // Patient is not owner
    });

    it('should set provider as room owner', async () => {
      // Mock data
      const mockConsultation = {
        id: 'consultation-123',
        roomUrl: 'https://example.daily.co/room123',
        appointment: {
          patient: { userId: 'patient-user-id' },
          provider: { userId: 'provider-user-id' }
        }
      };
      
      // Setup mocks
      mockPrisma.consultation.findUnique.mockResolvedValue(mockConsultation);
      
      // Execute
      await consultationService.generateRoomToken('consultation-123', 'provider-user-id');
      
      // Verify the request body
      const requestBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
      expect(requestBody.properties.is_owner).toBe(true); // Provider is owner
    });

    it('should reject unauthorized users', async () => {
      // Mock data
      const mockConsultation = {
        id: 'consultation-123',
        roomUrl: 'https://example.daily.co/room123',
        appointment: {
          patient: { userId: 'patient-user-id' },
          provider: { userId: 'provider-user-id' }
        }
      };
      
      // Setup mocks
      mockPrisma.consultation.findUnique.mockResolvedValue(mockConsultation);
      
      // Execute and verify
      await expect(consultationService.generateRoomToken('consultation-123', 'unauthorized-user-id'))
        .rejects.toThrow('User not authorized for this consultation');
    });
  });

  describe('createConsultation', () => {
    it('should return existing consultation if it exists', async () => {
      // Mock data
      const mockConsultation = {
        id: 'consultation-123',
        appointmentId: 'appointment-123',
        roomUrl: 'https://example.daily.co/room123',
        status: 'SCHEDULED'
      };
      
      // Setup mock
      mockPrisma.consultation.findFirst.mockResolvedValue(mockConsultation);
      
      // Execute
      const result = await consultationService.createConsultation('appointment-123');
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.consultation).toEqual(mockConsultation);
      expect(mockPrisma.consultation.create).not.toHaveBeenCalled();
    });

    it('should create a new consultation if none exists', async () => {
      // Mock data
      const mockNewConsultation = {
        id: 'consultation-123',
        appointmentId: 'appointment-123',
        roomUrl: 'https://example.daily.co/room123',
        status: 'SCHEDULED'
      };
      
      // Setup mocks
      mockPrisma.consultation.findFirst.mockResolvedValue(null);
      mockPrisma.consultation.create.mockResolvedValue(mockNewConsultation);
      
      // Mock createConsultationRoom
      vi.spyOn(consultationService, 'createConsultationRoom').mockResolvedValue('https://example.daily.co/room123');
      
      // Execute
      const result = await consultationService.createConsultation('appointment-123');
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.consultation).toEqual(mockNewConsultation);
      expect(consultationService.createConsultationRoom).toHaveBeenCalledWith('appointment-123');
      expect(mockPrisma.consultation.create).toHaveBeenCalledWith({
        data: {
          appointmentId: 'appointment-123',
          roomUrl: 'https://example.daily.co/room123',
          status: 'SCHEDULED',
          videoEnabled: false,
        },
      });
    });
  });

  describe('updateConsultationStatus', () => {
    it('should update the consultation status', async () => {
      // Mock data
      const mockUpdatedConsultation = {
        id: 'consultation-123',
        status: 'IN_PROGRESS'
      };
      
      // Setup mock
      mockPrisma.consultation.update.mockResolvedValue(mockUpdatedConsultation);
      
      // Execute
      const result = await consultationService.updateConsultationStatus('consultation-123', 'IN_PROGRESS');
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.consultation).toEqual(mockUpdatedConsultation);
      expect(mockPrisma.consultation.update).toHaveBeenCalledWith({
        where: { id: 'consultation-123' },
        data: {
          status: 'IN_PROGRESS',
          updatedAt: expect.any(Date)
        },
      });
    });
  });

  describe('updateConsultation', () => {
    it('should update the consultation with provided data', async () => {
      // Mock data
      const mockUpdatedConsultation = {
        id: 'consultation-123',
        videoEnabled: true
      };
      
      // Setup mock
      mockPrisma.consultation.update.mockResolvedValue(mockUpdatedConsultation);
      
      // Execute
      const result = await consultationService.updateConsultation('consultation-123', { videoEnabled: true });
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.consultation).toEqual(mockUpdatedConsultation);
      expect(mockPrisma.consultation.update).toHaveBeenCalledWith({
        where: { id: 'consultation-123' },
        data: {
          videoEnabled: true,
          updatedAt: expect.any(Date)
        },
      });
    });
  });
});

