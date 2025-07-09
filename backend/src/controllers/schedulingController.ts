import { Response } from 'express';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';
import { schedulingService } from '@/services/schedulingService';
import { z } from 'zod';

// Validation schemas
const getAvailableSlotsSchema = z.object({
  providerId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  timezone: z.string().min(1, 'Timezone is required'),
  duration: z.string().transform(Number).pipe(z.number().min(15).max(240)).optional(), // 15 minutes to 4 hours
});

const createRecurringAppointmentSchema = z.object({
  providerId: z.string().cuid(),
  startDateTime: z.string().datetime(),
  duration: z.number().min(15).max(240),
  reason: z.string().min(1, 'Reason is required'),
  consultationType: z.enum(['VIDEO', 'AUDIO', 'IN_PERSON']),
  recurrencePattern: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  recurrenceCount: z.number().min(1).max(365).optional(),
  recurrenceEndDate: z.string().datetime().optional(),
  timezone: z.string().min(1, 'Timezone is required'),
});

const checkSlotAvailabilitySchema = z.object({
  providerId: z.string().cuid(),
  startDateTime: z.string().datetime(),
  duration: z.number().min(15).max(240),
});

/**
 * Get available time slots for a provider
 * GET /api/scheduling/available-slots
 */
export const getAvailableSlots = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const validation = getAvailableSlotsSchema.safeParse(req.query);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { providerId, date, timezone, duration } = validation.data;

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

    const availableSlots = await schedulingService.getAvailableSlots({
      providerId,
      date,
      timezone,
      duration: duration || undefined,
    });

    res.json({
      success: true,
      data: {
        provider: {
          id: provider.id,
          name: provider.user.name,
        },
        date,
        timezone,
        duration: duration || 30,
        slots: availableSlots,
        totalSlots: availableSlots.length,
        availableSlots: availableSlots.filter(slot => slot.isAvailable).length,
      },
    });
  } catch (error) {
    logger.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available slots',
    });
  }
};

/**
 * Check if a specific time slot is available
 * POST /api/scheduling/check-availability
 */
export const checkSlotAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const validation = checkSlotAvailabilitySchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { providerId, startDateTime, duration } = validation.data;

    const startDate = new Date(startDateTime);
    const availability = await schedulingService.isSlotAvailable(
      providerId,
      startDate,
      duration
    );

    res.json({
      success: true,
      data: {
        providerId,
        startDateTime: startDate,
        duration,
        available: availability.available,
        conflictReason: availability.conflictReason,
      },
    });
  } catch (error) {
    logger.error('Check slot availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check slot availability',
    });
  }
};

/**
 * Create recurring appointments
 * POST /api/scheduling/recurring-appointments
 */
export const createRecurringAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'PATIENT') {
      res.status(403).json({
        success: false,
        error: 'Only patients can create appointments',
      });
      return;
    }

    const validation = createRecurringAppointmentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const {
      providerId,
      startDateTime,
      duration,
      reason,
      consultationType,
      recurrencePattern,
      recurrenceCount,
      recurrenceEndDate,
      timezone,
    } = validation.data;

    // Get patient profile
    const patient = await prisma.patient.findUnique({
      where: { userId: req.user.id },
      select: { id: true },
    });

    if (!patient) {
      res.status(404).json({
        success: false,
        error: 'Patient profile not found',
      });
      return;
    }

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

    const appointmentIds = await schedulingService.createRecurringAppointments({
      patientId: patient.id,
      providerId,
      startDateTime: new Date(startDateTime),
      duration,
      reason,
      consultationType,
      recurrencePattern,
      recurrenceCount: recurrenceCount || undefined,
      recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : undefined,
      timezone,
    });

    // Get created appointments for response
    const createdAppointments = await prisma.appointment.findMany({
      where: {
        id: {
          in: appointmentIds,
        },
      },
      include: {
        provider: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });

    res.status(201).json({
      success: true,
      data: {
        appointments: createdAppointments,
        totalCreated: appointmentIds.length,
        recurrencePattern,
        provider: {
          id: provider.id,
          name: provider.user.name,
        },
      },
      message: `Successfully created ${appointmentIds.length} recurring appointments`,
    });
  } catch (error) {
    logger.error('Create recurring appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create recurring appointments',
    });
  }
};

/**
 * Get timezone information
 * GET /api/scheduling/timezones
 */
export const getTimezones = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Common timezones for healthcare applications
    const timezones = [
      { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5/-4' },
      { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6/-5' },
      { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7/-6' },
      { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8/-7' },
      { value: 'America/Phoenix', label: 'Arizona Time (MST)', offset: 'UTC-7' },
      { value: 'America/Anchorage', label: 'Alaska Time (AKST)', offset: 'UTC-9/-8' },
      { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', offset: 'UTC-10' },
      { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)', offset: 'UTC+0/+1' },
      { value: 'Europe/Paris', label: 'Central European Time (CET)', offset: 'UTC+1/+2' },
      { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)', offset: 'UTC+9' },
      { value: 'Australia/Sydney', label: 'Australian Eastern Time (AEST)', offset: 'UTC+10/+11' },
    ];

    res.json({
      success: true,
      data: { timezones },
    });
  } catch (error) {
    logger.error('Get timezones error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get timezones',
    });
  }
};
