import { Response } from 'express';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';
import { schedulingService } from '@/services/schedulingService';
import { activityLogService } from '@/services/activityLogService';
import { ConflictDetectionService } from '@/services/conflictDetectionService';
import { z } from 'zod';
import { startOfDay, endOfDay } from 'date-fns';

// Validation schemas
const updateAppointmentStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
  notes: z.string().optional(),
});

const rescheduleAppointmentSchema = z.object({
  appointmentDate: z.string().datetime(),
  duration: z.number().min(15).max(240).optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  reason: z.string().optional(),
});

const appointmentQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 100) : 10),
  status: z.string().optional(),
  providerId: z.string().optional(),
  patientId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  consultationType: z.enum(['VIDEO', 'AUDIO']).optional(),
  sortBy: z.enum(['appointmentDate', 'createdAt', 'status']).optional().default('appointmentDate'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

const cancelAppointmentSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required'),
  refundRequested: z.boolean().default(false),
});

/**
 * Create new appointment
 * POST /api/appointments
 */
export const createAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
        error: 'Only patients can book appointments',
      });
      return;
    }

    const {
      providerId,
      appointmentDate,
      reason = 'General consultation',
      consultationType = 'VIDEO',
      duration = 30,
      timezone = 'UTC'
    } = req.body;

    // Validate required fields
    if (!providerId || !appointmentDate) {
      res.status(400).json({
        success: false,
        error: 'Provider ID and appointment date are required',
      });
      return;
    }

    // Validate consultation type
    if (!['VIDEO', 'AUDIO'].includes(consultationType)) {
      res.status(400).json({
        success: false,
        error: 'Invalid consultation type. Must be VIDEO or AUDIO',
      });
      return;
    }

    // Validate duration
    if (duration < 15 || duration > 240) {
      res.status(400).json({
        success: false,
        error: 'Duration must be between 15 and 240 minutes',
      });
      return;
    }

    logger.info(`📝 Creating appointment: ${req.user.email} with provider ${providerId} at ${appointmentDate}`);

    // Get patient ID
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

    // Verify provider exists and is active
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: {
        id: true,
        isVerified: true,
        isActive: true,
        approvalStatus: true,
        consultationFee: true,
        specialization: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        error: 'Provider not found',
      });
      return;
    }

    if (!provider.isVerified || !provider.isActive || provider.approvalStatus !== 'APPROVED') {
      res.status(400).json({
        success: false,
        error: 'Provider is not available for appointments',
        details: {
          isVerified: provider.isVerified,
          isActive: provider.isActive,
          approvalStatus: provider.approvalStatus
        }
      });
      return;
    }

    logger.info(`✅ Provider verified: ${provider.user.name} (${provider.specialization})`);

    // Parse and validate appointment date
    const startDateTime = new Date(appointmentDate);

    if (isNaN(startDateTime.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid appointment date format',
      });
      return;
    }

    // Check if appointment is in the past
    if (startDateTime <= new Date()) {
      res.status(400).json({
        success: false,
        error: 'Cannot book appointments in the past',
      });
      return;
    }

    logger.info(`🔍 Checking availability for ${startDateTime.toISOString()}`);

    // Use enhanced conflict detection service
    const conflictCheck = await ConflictDetectionService.checkAppointmentBooking(
      providerId,
      startDateTime,
      duration,
      patient.id
    );

    if (!conflictCheck.isValid) {
      logger.warn(`❌ Slot not available due to conflicts:`, conflictCheck.conflicts);
      res.status(409).json({
        success: false,
        error: 'Time slot is not available',
        details: {
          conflicts: conflictCheck.conflicts,
          warnings: conflictCheck.warnings,
          suggestions: conflictCheck.suggestions
        },
      });
      return;
    }

    // Log any warnings
    if (conflictCheck.warnings.length > 0) {
      logger.warn(`⚠️ Booking warnings:`, conflictCheck.warnings);
    }

    logger.info(`✅ Slot available, creating appointment`);

    // Create appointment with transaction for data consistency
    const appointment = await prisma.$transaction(async (tx) => {
      // Double-check availability within transaction
      const conflictingAppointment = await tx.appointment.findFirst({
        where: {
          providerId,
          appointmentDate: {
            gte: startDateTime,
            lt: new Date(startDateTime.getTime() + duration * 60 * 1000),
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
        },
      });

      if (conflictingAppointment) {
        throw new Error('Time slot was just booked by another patient');
      }

      // Create the appointment
      return await tx.appointment.create({
        data: {
          providerId,
          patientId: patient.id,
          appointmentDate: startDateTime,
          duration,
          reason,
          consultationType,
          status: 'SCHEDULED',
          timezone,
        },
        include: {
          provider: {
            select: {
              id: true,
              specialization: true,
              consultationFee: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          patient: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });
    });

    logger.info(`✅ Appointment created successfully: ID ${appointment.id}`);

    // Log activity for both patient and provider
    try {
      await activityLogService.logAppointment(
        req.user.id,
        'CREATED',
        appointment.id,
        {
          providerId: appointment.providerId,
          appointmentDate: appointment.appointmentDate,
          consultationType: appointment.consultationType,
        }
      );

      // Log for provider as well
      await activityLogService.logAppointment(
        appointment.provider.user.id,
        'CREATED',
        appointment.id,
        {
          patientId: appointment.patientId,
          appointmentDate: appointment.appointmentDate,
          consultationType: appointment.consultationType,
        }
      );
    } catch (activityError) {
      logger.error('Activity logging error (non-blocking):', activityError);
    }

    // TODO: Send notifications to both patient and provider
    // This would typically involve email/SMS services
    try {
      // Log notification intent (replace with actual notification service)
      logger.info(`📧 Notification: Appointment confirmation to ${appointment.patient.user.email}`);
      logger.info(`📧 Notification: New appointment alert to ${appointment.provider.user.email}`);

      // Here you would integrate with email service like SendGrid, AWS SES, etc.
      // await notificationService.sendAppointmentConfirmation(appointment);
    } catch (notificationError) {
      logger.error('Notification error (non-blocking):', notificationError);
      // Don't fail the appointment creation if notifications fail
    }

    res.status(201).json({
      success: true,
      data: {
        appointment,
        bookingDetails: {
          appointmentId: appointment.id,
          appointmentDate: appointment.appointmentDate,
          duration: appointment.duration,
          consultationType: appointment.consultationType,
          provider: {
            name: appointment.provider.user.name,
            specialization: appointment.provider.specialization,
            consultationFee: appointment.provider.consultationFee,
          },
          patient: {
            name: appointment.patient.user.name,
          },
          status: appointment.status,
          nextSteps: [
            'You will receive a confirmation email shortly',
            'Join the consultation 5 minutes before the scheduled time',
            'Prepare any questions or documents you want to discuss'
          ]
        }
      },
      message: 'Appointment booked successfully',
    });
  } catch (error) {
    logger.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create appointment',
    });
  }
};

/**
 * Get user's appointments
 * GET /api/appointments
 */
export const getAppointments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // Validate and parse query parameters
    const queryParams = appointmentQuerySchema.parse(req.query);
    const {
      page,
      limit,
      status,
      providerId,
      patientId,
      dateFrom,
      dateTo,
      consultationType,
      sortBy,
      sortOrder
    } = queryParams;

    const skip = (page - 1) * limit;

    logger.info(`📋 Getting appointments for user: ${req.user.email} with filters:`, queryParams);

    const where: any = {};

    // Role-based filtering
    if (req.user.role === 'PATIENT') {
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

      where.patientId = patient.id;

      // Patients can only see their own appointments
      if (providerId) {
        where.providerId = providerId;
      }
    } else if (req.user.role === 'PROVIDER' || req.user.role === 'DOCTOR') {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });

      if (!provider) {
        res.status(404).json({
          success: false,
          error: 'Provider profile not found',
        });
        return;
      }

      where.providerId = provider.id;

      // Providers can only see their own appointments
      if (patientId) {
        where.patientId = patientId;
      }
    } else if (req.user.role === 'ADMIN') {
      // Admins can filter by both provider and patient
      if (providerId) {
        where.providerId = providerId;
      }
      if (patientId) {
        where.patientId = patientId;
      }
    }

    // Status filtering
    if (status) {
      if (status.includes(',')) {
        where.status = { in: status.split(',') };
      } else {
        where.status = status;
      }
    }

    // Consultation type filtering
    if (consultationType) {
      where.consultationType = consultationType;
    }

    // Date range filtering
    if (dateFrom || dateTo) {
      where.appointmentDate = {};

      if (dateFrom) {
        where.appointmentDate.gte = startOfDay(new Date(dateFrom));
      }

      if (dateTo) {
        where.appointmentDate.lte = endOfDay(new Date(dateTo));
      }
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          provider: {
            select: {
              id: true,
              specialization: true,
              consultationFee: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          patient: {
            select: {
              id: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          consultation: {
            select: {
              id: true,
              roomUrl: true,
              status: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null,
        },
        filters: {
          status,
          providerId,
          patientId,
          dateFrom,
          dateTo,
          consultationType,
          sortBy,
          sortOrder,
        },
      },
      message: `Retrieved ${appointments.length} appointments`,
    });
  } catch (error) {
    logger.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get appointments',
    });
  }
};

/**
 * Get specific appointment
 * GET /api/appointments/:id
 */
export const getAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
      return;
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            specialization: true,
            bio: true,
            consultationFee: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            dateOfBirth: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        consultation: {
          select: {
            id: true,
            roomUrl: true,
            status: true,
            notes: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
          },
        },
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && appointment.patient?.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && appointment.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    res.json({
      success: true,
      data: { appointment },
    });
  } catch (error) {
    logger.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get appointment',
    });
  }
};

/**
 * Update appointment status
 * PUT /api/appointments/:id/status
 */
export const updateAppointmentStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
      return;
    }

    const validStatuses = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Invalid status',
      });
      return;
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            user: { select: { id: true } }
          }
        },
        patient: {
          select: {
            user: { select: { id: true } }
          }
        }
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && appointment.patient?.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && appointment.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Business rules for status changes
    if (status === 'CANCELLED' && appointment.status === 'COMPLETED') {
      res.status(400).json({
        success: false,
        error: 'Cannot cancel completed appointment',
      });
      return;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status },
      include: {
        provider: {
          select: {
            id: true,
            specialization: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: { appointment: updatedAppointment },
      message: 'Appointment status updated successfully',
    });
  } catch (error) {
    logger.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment status',
    });
  }
};

/**
 * Cancel appointment
 * DELETE /api/appointments/:id
 */
export const cancelAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
      return;
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            user: { select: { id: true } }
          }
        },
        patient: {
          select: {
            user: { select: { id: true } }
          }
        }
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && appointment.patient?.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && appointment.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'COMPLETED') {
      res.status(400).json({
        success: false,
        error: 'Cannot cancel completed appointment',
      });
      return;
    }

    if (appointment.status === 'CANCELLED') {
      res.status(400).json({
        success: false,
        error: 'Appointment is already cancelled',
      });
      return;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({
      success: true,
      data: { appointment: updatedAppointment },
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    logger.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment',
    });
  }
};

/**
 * Enhanced appointment status update with lifecycle management
 * PUT /api/appointments/:id/status-enhanced
 */
export const updateAppointmentStatusEnhanced = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
      return;
    }

    // Validate input
    const validation = updateAppointmentStatusSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { status, notes } = validation.data;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            user: { select: { id: true, name: true } }
          }
        },
        patient: {
          select: {
            user: { select: { id: true, name: true } }
          }
        }
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && appointment.patient?.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && appointment.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Enhanced business rules for status transitions
    const validTransitions: Record<string, string[]> = {
      'SCHEDULED': ['CONFIRMED', 'CANCELLED', 'NO_SHOW'],
      'CONFIRMED': ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [], // Cannot change from completed
      'CANCELLED': [], // Cannot change from cancelled
      'NO_SHOW': [], // Cannot change from no-show
    };

    const allowedStatuses = validTransitions[appointment.status] || [];
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: `Cannot change status from ${appointment.status} to ${status}`,
        allowedTransitions: allowedStatuses,
      });
      return;
    }

    // Role-based restrictions
    if (req.user.role === 'PATIENT') {
      // Patients can only cancel their own appointments
      if (status !== 'CANCELLED') {
        res.status(403).json({
          success: false,
          error: 'Patients can only cancel appointments',
        });
        return;
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        notes: notes ? `${appointment.notes || ''}\n[${new Date().toISOString()}] Status changed to ${status}: ${notes}` : appointment.notes,
        updatedAt: new Date(),
      },
      include: {
        provider: {
          select: {
            id: true,
            specialization: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Log status change
    logger.info('Appointment status updated:', {
      appointmentId: id,
      oldStatus: appointment.status,
      newStatus: status,
      updatedBy: req.user.email,
    });

    res.json({
      success: true,
      data: { appointment: updatedAppointment },
      message: `Appointment status updated to ${status}`,
    });
  } catch (error) {
    logger.error('Update appointment status enhanced error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment status',
    });
  }
};

/**
 * Reschedule appointment
 * PUT /api/appointments/:id/reschedule
 */
export const rescheduleAppointment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
      return;
    }

    // Validate input
    const validation = rescheduleAppointmentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { appointmentDate, duration, timezone, reason } = validation.data;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            user: { select: { id: true, name: true } }
          }
        },
        patient: {
          select: {
            id: true,
            user: { select: { id: true, name: true } }
          }
        }
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && appointment.patient?.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && appointment.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Check if appointment can be rescheduled
    if (!['SCHEDULED', 'CONFIRMED'].includes(appointment.status)) {
      res.status(400).json({
        success: false,
        error: 'Only scheduled or confirmed appointments can be rescheduled',
      });
      return;
    }

    // Check new slot availability
    const newStartDateTime = new Date(appointmentDate);
    const newDuration = duration || appointment.duration || 30; // Default to 30 minutes

    const availability = await schedulingService.isSlotAvailable(
      appointment.providerId,
      newStartDateTime,
      newDuration,
      appointment.id // Exclude current appointment from conflict check
    );

    if (!availability.available) {
      res.status(409).json({
        success: false,
        error: 'New time slot is not available',
        details: availability.conflictReason,
      });
      return;
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: newStartDateTime,
        duration: newDuration,
        timezone,
        reason: reason || appointment.reason,
        status: 'SCHEDULED', // Reset to scheduled after reschedule
        notes: `${appointment.notes || ''}\n[${new Date().toISOString()}] Rescheduled from ${appointment.appointmentDate} to ${newStartDateTime} by ${req.user.email}`,
        updatedAt: new Date(),
      },
      include: {
        provider: {
          select: {
            id: true,
            specialization: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Log reschedule
    logger.info('Appointment rescheduled:', {
      appointmentId: id,
      oldDate: appointment.appointmentDate,
      newDate: newStartDateTime,
      rescheduledBy: req.user.email,
    });

    res.json({
      success: true,
      data: { appointment: updatedAppointment },
      message: 'Appointment rescheduled successfully',
    });
  } catch (error) {
    logger.error('Reschedule appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reschedule appointment',
    });
  }
};

/**
 * Enhanced cancel appointment with policies
 * PUT /api/appointments/:id/cancel-enhanced
 */
export const cancelAppointmentEnhanced = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Appointment ID is required',
      });
      return;
    }

    // Validate input
    const validation = cancelAppointmentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors,
      });
      return;
    }

    const { reason } = validation.data;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            user: { select: { id: true, name: true } }
          }
        },
        patient: {
          select: {
            id: true,
            user: { select: { id: true, name: true } }
          }
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
          }
        }
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Appointment not found',
      });
      return;
    }

    // Check authorization
    const isPatient = req.user.role === 'PATIENT' && appointment.patient?.user.id === req.user.id;
    const isProvider = req.user.role === 'PROVIDER' && appointment.provider?.user.id === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isPatient && !isProvider && !isAdmin) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
      });
      return;
    }

    // Check if appointment can be cancelled
    if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
      res.status(400).json({
        success: false,
        error: 'Cannot cancel completed or already cancelled appointment',
      });
      return;
    }

    // Calculate cancellation policy
    const now = new Date();
    const appointmentTime = new Date(appointment.appointmentDate);
    const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let cancellationFee = 0;
    let refundEligible = false;

    if (hoursUntilAppointment >= 24) {
      // More than 24 hours: full refund
      refundEligible = true;
      cancellationFee = 0;
    } else if (hoursUntilAppointment >= 2) {
      // 2-24 hours: 50% cancellation fee
      refundEligible = true;
      cancellationFee = 0.5;
    } else {
      // Less than 2 hours: no refund
      refundEligible = false;
      cancellationFee = 1.0;
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: `${appointment.notes || ''}\n[${new Date().toISOString()}] Cancelled by ${req.user.email}. Reason: ${reason}. Hours until appointment: ${hoursUntilAppointment.toFixed(1)}`,
        updatedAt: new Date(),
      },
      include: {
        provider: {
          select: {
            id: true,
            specialization: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
          }
        }
      },
    });

    // Log cancellation
    logger.info('Appointment cancelled:', {
      appointmentId: id,
      cancelledBy: req.user.email,
      reason,
      hoursUntilAppointment,
      refundEligible,
      cancellationFee,
    });

    res.json({
      success: true,
      data: {
        appointment: updatedAppointment,
        cancellationPolicy: {
          hoursUntilAppointment: hoursUntilAppointment.toFixed(1),
          refundEligible,
          cancellationFee: `${(cancellationFee * 100).toFixed(0)}%`,
          refundAmount: appointment.payment ?
            (Number(appointment.payment.amount) * (1 - cancellationFee)).toFixed(2) :
            null,
        }
      },
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    logger.error('Cancel appointment enhanced error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment',
    });
  }
};

/**
 * Check real-time availability for a specific time slot
 * POST /api/appointments/check-availability
 */
export const checkSlotAvailability = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { providerId, startDateTime, duration = 30 } = req.body;

    if (!providerId || !startDateTime) {
      res.status(400).json({
        success: false,
        error: 'Provider ID and start date time are required',
      });
      return;
    }

    logger.info(`🔍 Checking slot availability: ${providerId} at ${startDateTime}`);

    const startDate = new Date(startDateTime);
    const result = await schedulingService.isSlotAvailable(
      providerId,
      startDate,
      duration
    );

    if (result.available) {
      res.json({
        success: true,
        data: {
          available: true,
          message: 'Time slot is available'
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          available: false,
          reason: result.conflictReason || 'Time slot is not available'
        }
      });
    }
  } catch (error) {
    logger.error('Check slot availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check slot availability',
    });
  }
};
