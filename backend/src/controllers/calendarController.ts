import { Response } from 'express';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';
import { schedulingService } from '@/services/schedulingService';
import { z } from 'zod';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';

// Validation schemas
const getAvailabilitySchema = z.object({
  providerId: z.string().cuid(),
  dateFrom: z.string().datetime(),
  dateTo: z.string().datetime(),
  consultationType: z.enum(['VIDEO', 'AUDIO']).optional(),
});

const getDayAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

const blockTimeSlotSchema = z.object({
  providerId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
  reason: z.string().optional(),
});

/**
 * Get availability for a provider within a date range
 * GET /api/calendar/availability
 */
export const getAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const validation = getAvailabilitySchema.safeParse(req.query);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { providerId, dateFrom, dateTo, consultationType } = validation.data;

    // Check if provider exists and is approved
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        approvalStatus: true,
        isActive: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        error: 'Provider not found',
      });
      return;
    }

    if (provider.approvalStatus !== 'APPROVED' || !provider.isActive) {
      res.status(400).json({
        success: false,
        error: 'Provider is not available for appointments',
      });
      return;
    }

    const startDate = new Date(dateFrom);
    const endDate = new Date(dateTo);
    const dayAvailabilities = [];

    // Generate availability for each day in the range
    let currentDate = startDate;
    while (currentDate <= endDate) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      
      try {
        const availableSlots = await schedulingService.getAvailableSlots({
          providerId,
          date: dateString,
          timezone: 'UTC', // Default timezone, could be made configurable
          duration: 30, // Default 30-minute slots
        });

        // Get provider's working hours for this day
        const dayOfWeek = format(currentDate, 'EEEE').toUpperCase(); // MONDAY, TUESDAY, etc.
        const providerAvailability = await prisma.availability.findFirst({
          where: {
            providerId,
            dayOfWeek,
            isAvailable: true,
          },
        });

        const workingHours = providerAvailability
          ? {
              start: providerAvailability.startTime,
              end: providerAvailability.endTime,
            }
          : {
              start: '09:00',
              end: '17:00',
            };

        // Transform slots to match frontend expectations
        const timeSlots = availableSlots.map(slot => ({
          startTime: format(slot.startTime, 'HH:mm'),
          endTime: format(slot.endTime, 'HH:mm'),
          isAvailable: slot.isAvailable,
          isBlocked: !slot.isAvailable,
          blockReason: slot.conflictReason,
          appointmentId: undefined, // Not available in current interface
        }));

        dayAvailabilities.push({
          date: dateString,
          isAvailable: timeSlots.some(slot => slot.isAvailable),
          timeSlots,
          workingHours,
        });
      } catch (error) {
        logger.error(`Error getting availability for ${dateString}:`, error);
        // Add empty day if there's an error
        dayAvailabilities.push({
          date: dateString,
          isAvailable: false,
          timeSlots: [],
          workingHours: {
            start: '09:00',
            end: '17:00',
          },
        });
      }

      currentDate = addDays(currentDate, 1);
    }

    res.json({
      success: true,
      data: dayAvailabilities,
    });
  } catch (error) {
    logger.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch availability',
    });
  }
};

/**
 * Get availability for a specific day
 * GET /api/calendar/availability/:providerId
 */
export const getDayAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { providerId } = req.params;

    if (!providerId) {
      res.status(400).json({
        success: false,
        error: 'Provider ID is required',
      });
      return;
    }

    const validation = getDayAvailabilitySchema.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { date } = validation.data;

    // Check if provider exists
    const provider = await prisma.provider.findFirst({
      where: { id: providerId },
      select: {
        id: true,
        userId: true,
        specialization: true,
      },
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        error: 'Provider not found',
      });
      return;
    }

    // For now, assume all providers are active and approved
    // TODO: Add approval status and active status to Provider model if needed

    const availableSlots = await schedulingService.getAvailableSlots({
      providerId,
      date,
      timezone: 'UTC',
      duration: 30,
    });

    // Get provider's working hours for this day
    const dayOfWeek = format(new Date(date), 'EEEE').toUpperCase(); // MONDAY, TUESDAY, etc.
    const providerAvailability = await prisma.availability.findFirst({
      where: {
        providerId,
        dayOfWeek,
        isAvailable: true,
      },
    });

    const workingHours = providerAvailability
      ? {
          start: providerAvailability.startTime,
          end: providerAvailability.endTime,
        }
      : {
          start: '09:00',
          end: '17:00',
        };

    const timeSlots = availableSlots.map(slot => ({
      startTime: format(slot.startTime, 'HH:mm'),
      endTime: format(slot.endTime, 'HH:mm'),
      isAvailable: slot.isAvailable,
      isBlocked: !slot.isAvailable,
      blockReason: slot.conflictReason,
      appointmentId: undefined, // Not available in current interface
    }));

    const dayAvailability = {
      date,
      isAvailable: timeSlots.some(slot => slot.isAvailable),
      timeSlots,
      workingHours,
    };

    res.json({
      success: true,
      data: dayAvailability,
    });
  } catch (error) {
    logger.error('Get day availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch day availability',
    });
  }
};

/**
 * Block a time slot
 * POST /api/calendar/block-time
 */
export const blockTimeSlot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const validation = blockTimeSlotSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { providerId, date, startTime, endTime, reason } = validation.data;

    // Only providers can block their own time slots, or admins can block any
    if (req.user.role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!provider || provider.id !== providerId) {
        res.status(403).json({
          success: false,
          error: 'You can only block your own time slots',
        });
        return;
      }
    } else if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Only providers and admins can block time slots',
      });
      return;
    }

    // Create a blocked time slot (this would typically be stored in a separate table)
    // For now, we'll create a special appointment with status 'BLOCKED'
    const blockedSlot = await prisma.appointment.create({
      data: {
        providerId,
        patientId: 'system', // Special patient ID for blocked slots
        appointmentDate: new Date(`${date}T${startTime}:00.000Z`),
        reason: reason || 'Time slot blocked',
        status: 'CANCELLED', // Use CANCELLED status to indicate blocked
        consultationType: 'VIDEO',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: blockedSlot.id,
        providerId,
        title: 'Blocked Time',
        description: reason || 'Time slot blocked',
        startTime: `${date}T${startTime}:00.000Z`,
        endTime: `${date}T${endTime}:00.000Z`,
        type: 'blocked',
      },
      message: 'Time slot blocked successfully',
    });
  } catch (error) {
    logger.error('Block time slot error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to block time slot',
    });
  }
};

/**
 * Unblock a time slot
 * DELETE /api/calendar/block-time
 */
export const unblockTimeSlot = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { providerId, date, startTime } = req.query as Record<string, string>;

    if (!providerId || !date || !startTime) {
      res.status(400).json({
        success: false,
        error: 'providerId, date, and startTime are required',
      });
      return;
    }

    // Only providers can unblock their own time slots, or admins can unblock any
    if (req.user.role === 'PROVIDER') {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!provider || provider.id !== providerId) {
        res.status(403).json({
          success: false,
          error: 'You can only unblock your own time slots',
        });
        return;
      }
    } else if (req.user.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        error: 'Only providers and admins can unblock time slots',
      });
      return;
    }

    // Find and delete the blocked appointment
    const appointmentDate = new Date(`${date}T${startTime}:00.000Z`);
    const blockedAppointment = await prisma.appointment.findFirst({
      where: {
        providerId,
        appointmentDate,
        patientId: 'system',
        status: 'CANCELLED',
      },
    });

    if (!blockedAppointment) {
      res.status(404).json({
        success: false,
        error: 'Blocked time slot not found',
      });
      return;
    }

    await prisma.appointment.delete({
      where: { id: blockedAppointment.id },
    });

    res.json({
      success: true,
      message: 'Time slot unblocked successfully',
    });
  } catch (error) {
    logger.error('Unblock time slot error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unblock time slot',
    });
  }
};
