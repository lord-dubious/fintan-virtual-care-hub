import { PrismaClient } from '@prisma/client';
import { ApiResponse, Consultation, ConsultationStatus } from '../../../shared/domain';
import { logger } from '../utils/monitoring';

const prisma = new PrismaClient();

export const consultationService = {
  // Get consultation by ID
  async getConsultationById(consultationId: string): Promise<ApiResponse<Consultation | null>> {
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
          error: 'Consultation not found',
        };
      }

      return {
        success: true,
        data: consultation as unknown as Consultation,
      };
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Error fetching consultation:', errorData);
      return {
        success: false,
        error: 'Failed to fetch consultation',
      };
    }
  },

  // Get consultations by multiple appointment IDs
  async getConsultationsByAppointmentIds(appointmentIds: string[]): Promise<ApiResponse<Record<string, ConsultationStatus>>> {
    try {
      const consultations = await prisma.consultation.findMany({
        where: { appointmentId: { in: appointmentIds } },
        select: {
          appointmentId: true,
          status: true
        }
      });

      const statusMap: Record<string, ConsultationStatus> = {};
      consultations.forEach(consultation => {
        statusMap[consultation.appointmentId] = consultation.status;
      });

      // Add NOT_CREATED status for appointments without consultations
      appointmentIds.forEach(id => {
        if (!statusMap[id]) {
          statusMap[id] = 'NOT_CREATED' as ConsultationStatus;
        }
      });

      return {
        success: true,
        data: statusMap
      };
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Error fetching consultations by appointment IDs:', errorData);
      return {
        success: false,
        error: 'Failed to fetch consultations'
      };
    }
  },

  // Get consultation by appointment ID
  async getConsultationByAppointmentId(appointmentId: string): Promise<ApiResponse<Consultation | null>> {
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
          error: 'Consultation not found',
        };
      }

      return {
        success: true,
        data: consultation as unknown as Consultation,
      };
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Error fetching consultation by appointment ID:', errorData);
      return {
        success: false,
        error: 'Failed to fetch consultation',
      };
    }
  },

  // Create a new consultation
  async createConsultation(appointmentId: string): Promise<ApiResponse<Consultation>> {
    try {
      // Check if consultation already exists for this appointment
      const existingConsultation = await prisma.consultation.findFirst({
        where: { appointmentId },
      });

      if (existingConsultation) {
        return {
          success: true,
          data: existingConsultation as unknown as Consultation,
        };
      }

      // Instead of creating room here, rely on backend to create it.
      // The backend's /api/consultations/create/:appointmentId or /api/consultations/:appointmentId/join
      // endpoints will handle room creation and token generation.
      // For now, we'll just create the consultation record without a roomUrl here.
      // The roomUrl will be populated when the backend successfully creates the room.

      // Create consultation
      const consultation = await prisma.consultation.create({
        data: {
          appointmentId,
          status: ConsultationStatus.SCHEDULED,
          videoEnabled: false,
        },
      });

      return {
        success: true,
        data: consultation as unknown as Consultation,
      };
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Error creating consultation:', errorData);
      return {
        success: false,
        error: 'Failed to create consultation',
      };
    }
  },

  // Update consultation status
  async updateConsultationStatus(consultationId: string, status: ConsultationStatus): Promise<ApiResponse<Consultation>> {
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
        data: consultation as unknown as Consultation,
      };
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Error updating consultation status:', errorData);
      return {
        success: false,
        error: 'Failed to update consultation status',
      };
    }
  },

  // Update consultation
  async updateConsultation(consultationId: string, data: Record<string, unknown>): Promise<ApiResponse<Consultation>> {
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
        data: consultation as unknown as Consultation,
      };
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Error updating consultation:', errorData);
      return {
        success: false,
        error: 'Failed to update consultation',
      };
    }
  },
};
