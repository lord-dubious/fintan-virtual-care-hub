/**
 * @fileoverview Consultation Service for managing video/audio consultations
 * 
 * This service provides functionality for managing consultations between patients and providers.
 * It handles consultation creation, room generation, token generation, and status updates.
 * 
 * @module consultationService
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Result of a consultation operation
 * @typedef {Object} ConsultationResult
 * @property {boolean} success - Whether the operation was successful
 * @property {Object} [consultation] - The consultation object if successful
 * @property {string} [message] - Error message if unsuccessful
 */

/**
 * Consultation Service for managing video/audio consultations
 */
export const consultationService = {
  /**
   * Retrieves a consultation by ID
   * 
   * @param {string} consultationId - Consultation's unique identifier
   * @returns {Promise<ConsultationResult>} - Promise resolving to the consultation result
   * 
   * @example
   * // Get a consultation by ID
   * const result = await consultationService.getConsultationById('consultation-123');
   * if (result.success) {
   *   console.log('Consultation:', result.consultation);
   * } else {
   *   console.error('Error:', result.message);
   * }
   */
  async getConsultationById(consultationId) {
    try {
      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
        include: {
          appointment: {
            include: {
              patient: {
                include: {
                  user: true,
                },
              },
              provider: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (!consultation) {
        return {
          success: false,
          message: 'Consultation not found',
        };
      }

      return {
        success: true,
        consultation,
      };
    } catch (error) {
      console.error('Error fetching consultation:', error);
      return {
        success: false,
        message: 'Failed to fetch consultation',
      };
    }
  },

  /**
   * Retrieves a consultation by appointment ID
   * 
   * @param {string} appointmentId - Appointment's unique identifier
   * @returns {Promise<ConsultationResult>} - Promise resolving to the consultation result
   * 
   * @example
   * // Get a consultation by appointment ID
   * const result = await consultationService.getConsultationByAppointmentId('appointment-123');
   * if (result.success) {
   *   console.log('Consultation:', result.consultation);
   * } else {
   *   console.error('Error:', result.message);
   * }
   */
  async getConsultationByAppointmentId(appointmentId) {
    try {
      const consultation = await prisma.consultation.findFirst({
        where: { appointmentId },
        include: {
          appointment: {
            include: {
              patient: {
                include: {
                  user: true,
                },
              },
              provider: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (!consultation) {
        return {
          success: false,
          message: 'Consultation not found',
        };
      }

      return {
        success: true,
        consultation,
      };
    } catch (error) {
      console.error('Error fetching consultation by appointment ID:', error);
      return {
        success: false,
        message: 'Failed to fetch consultation',
      };
    }
  },

  /**
   * Creates a new consultation room using Daily.co API
   * 
   * @param {string} appointmentId - Appointment's unique identifier
   * @returns {Promise<string>} - Promise resolving to the room URL
   * @throws {Error} If appointment not found or room creation fails
   * 
   * @example
   * // Create a new consultation room
   * try {
   *   const roomUrl = await consultationService.createConsultationRoom('appointment-123');
   *   console.log('Room URL:', roomUrl);
   * } catch (error) {
   *   console.error('Error creating room:', error.message);
   * }
   */
  async createConsultationRoom(appointmentId) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
      });
      
      if (!appointment) {
        throw new Error('Appointment not found');
      }
      
      // Generate a unique room name
      const roomName = `consultation-${appointmentId}-${Date.now()}`;
      
      // Create a Daily.co room using their API
      const response = await fetch('https://api.daily.co/v1/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          name: roomName,
          properties: {
            exp: Math.floor(Date.now() / 1000) + 86400, // Expires in 24 hours
            enable_screenshare: true,
            enable_chat: true,
            // For audio calls, start with video off but allow it to be enabled
            start_video_off: appointment.consultationType === 'AUDIO',
            start_audio_off: false,
            eject_at_room_exp: true,
            eject_after_elapsed: 1800, // 30 minutes max
          },
        }),
      });
      
      const data = await response.json();
      return data.url; // Return the room URL
    } catch (error) {
      console.error('Error creating Daily.co room:', error);
      throw new Error('Failed to create consultation room');
    }
  },

  /**
   * Generates a secure token for joining a consultation room
   * 
   * @param {string} consultationId - Consultation's unique identifier
   * @param {string} userId - User's unique identifier
   * @returns {Promise<string>} - Promise resolving to the room token
   * @throws {Error} If consultation not found, user not authorized, or token generation fails
   * 
   * @example
   * // Generate a token for a user to join a consultation
   * try {
   *   const token = await consultationService.generateRoomToken('consultation-123', 'user-456');
   *   console.log('Room token:', token);
   * } catch (error) {
   *   console.error('Error generating token:', error.message);
   * }
   */
  async generateRoomToken(consultationId, userId) {
    try {
      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
        include: {
          appointment: {
            include: {
              patient: true,
              provider: true,
            },
          },
        },
      });
      
      if (!consultation) {
        throw new Error('Consultation not found');
      }
      
      // Check if user is authorized (either the patient or provider)
      const isAuthorized = 
        consultation.appointment.patient.userId === userId || 
        consultation.appointment.provider.userId === userId;
      
      if (!isAuthorized) {
        throw new Error('User not authorized for this consultation');
      }
      
      // Extract room name from URL
      const roomName = consultation.roomUrl.split('/').pop();
      
      // Generate a Daily.co token
      const response = await fetch('https://api.daily.co/v1/meeting-tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DAILY_API_KEY}`,
        },
        body: JSON.stringify({
          properties: {
            room_name: roomName,
            exp: Math.floor(Date.now() / 1000) + 3600, // Token expires in 1 hour
            is_owner: consultation.appointment.provider.userId === userId, // Provider is room owner
          },
        }),
      });
      
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error generating room token:', error);
      throw new Error('Failed to generate room token');
    }
  },

  /**
   * Creates a new consultation for an appointment
   * 
   * @param {string} appointmentId - Appointment's unique identifier
   * @returns {Promise<ConsultationResult>} - Promise resolving to the consultation result
   * 
   * @example
   * // Create a new consultation
   * const result = await consultationService.createConsultation('appointment-123');
   * if (result.success) {
   *   console.log('Consultation created:', result.consultation);
   * } else {
   *   console.error('Error:', result.message);
   * }
   */
  async createConsultation(appointmentId) {
    try {
      // Check if consultation already exists for this appointment
      const existingConsultation = await prisma.consultation.findFirst({
        where: { appointmentId },
      });

      if (existingConsultation) {
        return {
          success: true,
          consultation: existingConsultation,
        };
      }

      // Create a room URL
      const roomUrl = await this.createConsultationRoom(appointmentId);

      // Create consultation
      const consultation = await prisma.consultation.create({
        data: {
          appointmentId,
          roomUrl,
          status: 'SCHEDULED',
          videoEnabled: false,
        },
      });

      return {
        success: true,
        consultation,
      };
    } catch (error) {
      console.error('Error creating consultation:', error);
      return {
        success: false,
        message: 'Failed to create consultation',
      };
    }
  },

  /**
   * Updates a consultation's status
   * 
   * @param {string} consultationId - Consultation's unique identifier
   * @param {string} status - New consultation status
   * @returns {Promise<ConsultationResult>} - Promise resolving to the consultation result
   * 
   * @example
   * // Update a consultation's status to IN_PROGRESS
   * const result = await consultationService.updateConsultationStatus('consultation-123', 'IN_PROGRESS');
   * if (result.success) {
   *   console.log('Consultation updated:', result.consultation);
   * } else {
   *   console.error('Error:', result.message);
   * }
   */
  async updateConsultationStatus(consultationId, status) {
    try {
      const consultation = await prisma.consultation.update({
        where: { id: consultationId },
        data: {
          status,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        consultation,
      };
    } catch (error) {
      console.error('Error updating consultation status:', error);
      return {
        success: false,
        message: 'Failed to update consultation status',
      };
    }
  },

  /**
   * Updates a consultation with provided data
   * 
   * @param {string} consultationId - Consultation's unique identifier
   * @param {Object} data - Object containing fields to update
   * @returns {Promise<ConsultationResult>} - Promise resolving to the consultation result
   * 
   * @example
   * // Update a consultation to enable video
   * const result = await consultationService.updateConsultation('consultation-123', { videoEnabled: true });
   * if (result.success) {
   *   console.log('Consultation updated:', result.consultation);
   * } else {
   *   console.error('Error:', result.message);
   * }
   */
  async updateConsultation(consultationId, data) {
    try {
      const consultation = await prisma.consultation.update({
        where: { id: consultationId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return {
        success: true,
        consultation,
      };
    } catch (error) {
      console.error('Error updating consultation:', error);
      return {
        success: false,
        message: 'Failed to update consultation',
      };
    }
  },
};

