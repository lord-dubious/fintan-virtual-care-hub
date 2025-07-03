import { Response } from 'express';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';
import { schedulingService } from '@/services/schedulingService';
import { z } from 'zod';

// Validation schemas
const createAppointmentSchema = z.object({
  providerId: z.string().cuid(),
  appointmentDate: z.string().datetime(),
  duration: z.number().min(15).max(240).default(30),
  reason: z.string().min(1, 'Reason is required'),
  consultationType: z.enum(['VIDEO', 'AUDIO', 'IN_PERSON']).default('VIDEO'),
  timezone: z.string().min(1, 'Timezone is required'),
  notes: z.string().optional(),
});

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

    const { providerId, appointmentDate, reason, consultationType = 'VIDEO' } = req.body;

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
        user: {
          select: { name: true }
        }
      },
    });

    if (!provider || !provider.isVerified || !provider.isActive) {
      res.status(400).json({
        success: false,
        error: 'Provider not available',
      });
      return;
    }

    // Use scheduling service for comprehensive availability check
    const startDateTime = new Date(appointmentDate);
    const duration = 30; // Default duration
    const availability = await schedulingService.isSlotAvailable(
      providerId,
      startDateTime,
      duration
    );

    if (!availability.available) {
      res.status(409).json({
        success: false,
        error: 'Time slot is not available',
        details: availability.conflictReason,
      });
      return;
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        providerId,
        patientId: patient.id,
        appointmentDate: startDateTime,
        duration,
        reason,
        consultationType,
        status: 'SCHEDULED',
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

    res.status(201).json({
      success: true,
      data: { appointment },
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

    const { status, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

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
    } else if (req.user.role === 'PROVIDER') {
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
    }

    if (status) {
      where.status = status;
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
        take: limitNum,
        orderBy: {
          appointmentDate: 'desc',
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
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
    const newDuration = duration || appointment.duration;

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

    const { reason, refundRequested } = validation.data;

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
