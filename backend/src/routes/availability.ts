import express from 'express';
import { PrismaClient, DayOfWeek, ExceptionType } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { ConflictDetectionService } from '../services/conflictDetectionService';
import { AvailabilityService } from '../services/availabilityService';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createScheduleSchema = z.object({
  name: z.string().min(1).max(100),
  timezone: z.string().default('UTC'),
  isDefault: z.boolean().default(false),
  weeklyAvailability: z.array(z.object({
    dayOfWeek: z.nativeEnum(DayOfWeek),
    isAvailable: z.boolean(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  })),
  breakPeriods: z.array(z.object({
    dayOfWeek: z.nativeEnum(DayOfWeek).optional(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    title: z.string().optional(),
    isRecurring: z.boolean().default(true),
  })).default([]),
});

const updateScheduleSchema = createScheduleSchema.partial();

const createExceptionSchema = z.object({
  date: z.string().datetime(),
  type: z.nativeEnum(ExceptionType),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  title: z.string().min(1).max(200),
  notes: z.string().max(500).optional(),
  isRecurring: z.boolean().default(false),
  recurrencePattern: z.string().optional(),
});

// GET /api/availability/slots - Get available time slots for a provider
router.get('/slots', async (req, res) => {
  try {
    const { providerId, startDate, endDate, slotDuration } = req.query;

    if (!providerId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'providerId, startDate, and endDate are required'
      });
    }

    const slots = await AvailabilityService.getProviderAvailability(
      providerId as string,
      new Date(startDate as string),
      new Date(endDate as string),
      slotDuration ? parseInt(slotDuration as string) : 30
    );

    res.json({ success: true, data: { slots } });
  } catch (error) {
    console.error('Error fetching availability slots:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch availability slots' });
  }
});

// GET /api/availability/schedules - Get all schedules for a provider
router.get('/schedules', authenticateToken, authorizeRoles('PROVIDER', 'DOCTOR'), async (req, res) => {
  try {
    const providerId = req.user?.provider?.id;
    if (!providerId) {
      return res.status(404).json({ success: false, error: 'Provider not found' });
    }

    const schedules = await prisma.providerSchedule.findMany({
      where: { providerId },
      include: {
        weeklyAvailability: {
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
          ]
        },
        breakPeriods: {
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
          ]
        },
        scheduleExceptions: {
          where: {
            date: {
              gte: new Date()
            }
          },
          orderBy: { date: 'asc' }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({ success: true, data: { schedules } });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch schedules' });
  }
});

// GET /api/availability/schedules/:id - Get specific schedule
router.get('/schedules/:id', authenticateToken, authorizeRoles('PROVIDER', 'DOCTOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user?.provider?.id;

    const schedule = await prisma.providerSchedule.findFirst({
      where: { 
        id,
        providerId 
      },
      include: {
        weeklyAvailability: {
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
          ]
        },
        breakPeriods: {
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
          ]
        },
        scheduleExceptions: {
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }

    res.json({ success: true, data: { schedule } });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch schedule' });
  }
});

// POST /api/availability/schedules - Create new schedule
router.post('/schedules', authenticateToken, authorizeRoles('PROVIDER', 'DOCTOR'), async (req, res) => {
  try {
    const providerId = req.user?.provider?.id;
    if (!providerId) {
      return res.status(404).json({ success: false, error: 'Provider not found' });
    }

    const validatedData = createScheduleSchema.parse(req.body);

    // If this is set as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.providerSchedule.updateMany({
        where: { providerId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const schedule = await prisma.providerSchedule.create({
      data: {
        providerId,
        name: validatedData.name,
        timezone: validatedData.timezone,
        isDefault: validatedData.isDefault,
        weeklyAvailability: {
          create: validatedData.weeklyAvailability
        },
        breakPeriods: {
          create: validatedData.breakPeriods
        }
      },
      include: {
        weeklyAvailability: true,
        breakPeriods: true,
        scheduleExceptions: true
      }
    });

    res.status(201).json({ success: true, data: { schedule } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid data', details: error.errors });
    }
    console.error('Error creating schedule:', error);
    res.status(500).json({ success: false, error: 'Failed to create schedule' });
  }
});

// PUT /api/availability/schedules/:id - Update schedule
router.put('/schedules/:id', authenticateToken, authorizeRoles('PROVIDER', 'DOCTOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user?.provider?.id;

    const validatedData = updateScheduleSchema.parse(req.body);

    // Check if schedule exists and belongs to provider
    const existingSchedule = await prisma.providerSchedule.findFirst({
      where: { id, providerId }
    });

    if (!existingSchedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }

    // If this is set as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.providerSchedule.updateMany({
        where: { providerId, isDefault: true, id: { not: id } },
        data: { isDefault: false }
      });
    }

    // Update schedule in transaction
    const schedule = await prisma.$transaction(async (tx) => {
      // Update basic schedule info
      const updatedSchedule = await tx.providerSchedule.update({
        where: { id },
        data: {
          name: validatedData.name,
          timezone: validatedData.timezone,
          isDefault: validatedData.isDefault,
        }
      });

      // Update weekly availability if provided
      if (validatedData.weeklyAvailability) {
        await tx.weeklyAvailability.deleteMany({
          where: { scheduleId: id }
        });
        await tx.weeklyAvailability.createMany({
          data: validatedData.weeklyAvailability.map(wa => ({
            ...wa,
            scheduleId: id
          }))
        });
      }

      // Update break periods if provided
      if (validatedData.breakPeriods) {
        await tx.breakPeriod.deleteMany({
          where: { scheduleId: id }
        });
        await tx.breakPeriod.createMany({
          data: validatedData.breakPeriods.map(bp => ({
            ...bp,
            scheduleId: id
          }))
        });
      }

      return updatedSchedule;
    });

    // Fetch updated schedule with relations
    const fullSchedule = await prisma.providerSchedule.findUnique({
      where: { id },
      include: {
        weeklyAvailability: {
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
          ]
        },
        breakPeriods: {
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
          ]
        },
        scheduleExceptions: {
          orderBy: { date: 'asc' }
        }
      }
    });

    res.json({ success: true, data: { schedule: fullSchedule } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid data', details: error.errors });
    }
    console.error('Error updating schedule:', error);
    res.status(500).json({ success: false, error: 'Failed to update schedule' });
  }
});

// DELETE /api/availability/schedules/:id - Delete schedule
router.delete('/schedules/:id', authenticateToken, authorizeRoles('PROVIDER', 'DOCTOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user?.provider?.id;

    const schedule = await prisma.providerSchedule.findFirst({
      where: { id, providerId }
    });

    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }

    if (schedule.isDefault) {
      return res.status(400).json({ success: false, error: 'Cannot delete default schedule' });
    }

    await prisma.providerSchedule.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ success: false, error: 'Failed to delete schedule' });
  }
});

// POST /api/availability/schedules/:id/exceptions - Add schedule exception
router.post('/schedules/:id/exceptions', authenticateToken, authorizeRoles('PROVIDER', 'DOCTOR'), async (req, res) => {
  try {
    const { id: scheduleId } = req.params;
    const providerId = req.user?.provider?.id;

    const validatedData = createExceptionSchema.parse(req.body);

    // Verify schedule belongs to provider
    const schedule = await prisma.providerSchedule.findFirst({
      where: { id: scheduleId, providerId }
    });

    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }

    const exception = await prisma.scheduleException.create({
      data: {
        scheduleId,
        date: new Date(validatedData.date),
        type: validatedData.type,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        title: validatedData.title,
        notes: validatedData.notes,
        isRecurring: validatedData.isRecurring,
        recurrencePattern: validatedData.recurrencePattern,
      }
    });

    res.status(201).json({ success: true, data: { exception } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'Invalid data', details: error.errors });
    }
    console.error('Error creating exception:', error);
    res.status(500).json({ success: false, error: 'Failed to create exception' });
  }
});

// DELETE /api/availability/exceptions/:id - Delete schedule exception
router.delete('/exceptions/:id', authenticateToken, authorizeRoles('PROVIDER', 'DOCTOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user?.provider?.id;

    // Verify exception belongs to provider's schedule
    const exception = await prisma.scheduleException.findFirst({
      where: { 
        id,
        schedule: {
          providerId
        }
      }
    });

    if (!exception) {
      return res.status(404).json({ success: false, error: 'Exception not found' });
    }

    await prisma.scheduleException.delete({
      where: { id }
    });

    res.json({ success: true, message: 'Exception deleted successfully' });
  } catch (error) {
    console.error('Error deleting exception:', error);
    res.status(500).json({ success: false, error: 'Failed to delete exception' });
  }
});

// POST /api/availability/schedules/:id/copy - Copy schedule
router.post('/schedules/:id/copy', authenticateToken, authorizeRoles('PROVIDER', 'DOCTOR'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const providerId = req.user?.provider?.id;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const sourceSchedule = await prisma.providerSchedule.findFirst({
      where: { id, providerId },
      include: {
        weeklyAvailability: true,
        breakPeriods: true
      }
    });

    if (!sourceSchedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }

    const newSchedule = await prisma.providerSchedule.create({
      data: {
        providerId,
        name,
        timezone: sourceSchedule.timezone,
        isDefault: false,
        weeklyAvailability: {
          create: sourceSchedule.weeklyAvailability.map(wa => ({
            dayOfWeek: wa.dayOfWeek,
            isAvailable: wa.isAvailable,
            startTime: wa.startTime,
            endTime: wa.endTime
          }))
        },
        breakPeriods: {
          create: sourceSchedule.breakPeriods.map(bp => ({
            dayOfWeek: bp.dayOfWeek,
            startTime: bp.startTime,
            endTime: bp.endTime,
            title: bp.title,
            isRecurring: bp.isRecurring
          }))
        }
      },
      include: {
        weeklyAvailability: true,
        breakPeriods: true,
        scheduleExceptions: true
      }
    });

    res.status(201).json({ success: true, data: { schedule: newSchedule } });
  } catch (error) {
    console.error('Error copying schedule:', error);
    res.status(500).json({ success: false, error: 'Failed to copy schedule' });
  }
});

// POST /api/availability/check-conflicts - Check for appointment booking conflicts
router.post('/check-conflicts', authenticateToken, async (req, res) => {
  try {
    const { providerId, appointmentDate, duration, patientId, excludeAppointmentId } = req.body;

    if (!providerId || !appointmentDate || !duration) {
      return res.status(400).json({
        success: false,
        error: 'providerId, appointmentDate, and duration are required'
      });
    }

    const result = await ConflictDetectionService.checkAppointmentBooking(
      providerId,
      new Date(appointmentDate),
      duration,
      patientId,
      excludeAppointmentId
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error checking conflicts:', error);
    res.status(500).json({ success: false, error: 'Failed to check conflicts' });
  }
});

// POST /api/availability/validate-schedule - Validate schedule changes
router.post('/validate-schedule', authenticateToken, authorizeRoles('PROVIDER', 'DOCTOR'), async (req, res) => {
  try {
    const { scheduleId, weeklyAvailability, breakPeriods, exceptions } = req.body;
    const providerId = req.user?.provider?.id;

    if (!scheduleId) {
      return res.status(400).json({ success: false, error: 'scheduleId is required' });
    }

    // Verify schedule belongs to provider
    const schedule = await prisma.providerSchedule.findFirst({
      where: { id: scheduleId, providerId }
    });

    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }

    const result = await ConflictDetectionService.validateScheduleChanges(
      scheduleId,
      weeklyAvailability || [],
      breakPeriods || [],
      exceptions || []
    );

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error validating schedule:', error);
    res.status(500).json({ success: false, error: 'Failed to validate schedule' });
  }
});

// POST /api/availability/check-double-booking - Check for double booking
router.post('/check-double-booking', authenticateToken, authorizeRoles('PROVIDER', 'DOCTOR', 'ADMIN'), async (req, res) => {
  try {
    const { providerId, appointmentDate, duration, excludeAppointmentId } = req.body;

    if (!providerId || !appointmentDate || !duration) {
      return res.status(400).json({
        success: false,
        error: 'providerId, appointmentDate, and duration are required'
      });
    }

    const conflicts = await ConflictDetectionService.checkDoubleBooking(
      providerId,
      new Date(appointmentDate),
      duration,
      excludeAppointmentId
    );

    res.json({
      success: true,
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts
      }
    });
  } catch (error) {
    console.error('Error checking double booking:', error);
    res.status(500).json({ success: false, error: 'Failed to check double booking' });
  }
});

export default router;
