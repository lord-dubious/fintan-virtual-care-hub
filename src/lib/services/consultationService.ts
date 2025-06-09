import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const consultationService = {
  // Get consultation by ID
  async getConsultationById(consultationId: string): Promise<any> {
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

  // Get consultation by appointment ID
  async getConsultationByAppointmentId(appointmentId: string): Promise<any> {
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

  // Create a consultation room
  async createConsultationRoom(appointmentId: string): Promise<string> {
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

  // Generate a secure room token
  async generateRoomToken(consultationId: string, userId: string): Promise<string> {
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

  // Create a new consultation
  async createConsultation(appointmentId: string): Promise<any> {
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

  // Update consultation status
  async updateConsultationStatus(consultationId: string, status: string): Promise<any> {
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

  // Update consultation
  async updateConsultation(consultationId: string, data: any): Promise<any> {
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

