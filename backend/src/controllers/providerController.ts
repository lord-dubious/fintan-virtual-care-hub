import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';
import { startOfDay, endOfDay, subDays, addDays } from 'date-fns';

/**
 * Get all providers
 * GET /api/providers
 */
export const getProviders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      specialization, 
      isActive = 'true',
      page = '1', 
      limit = '10' 
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      isActive: isActive === 'true',
    };

    if (specialization) {
      where.specialization = {
        contains: specialization as string,
        mode: 'insensitive',
      };
    }

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profilePicture: true,
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: {
          user: {
            name: 'asc',
          },
        },
      }),
      prisma.provider.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        providers,
        total,
        page: pageNum,
        totalPages,
      },
      message: 'Providers retrieved successfully',
    });
  } catch (error) {
    logger.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve providers',
    });
  }
};

/**
 * Get provider by ID
 * GET /api/providers/:id
 */
export const getProvider = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Provider ID is required',
      });
      return;
    }

    
    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePicture: true,
          },
        },
        availability: {
          orderBy: {
            dayOfWeek: 'asc',
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

    res.json({
      success: true,
      data: provider,
      message: 'Provider retrieved successfully',
    });
  } catch (error) {
    logger.error('Get provider error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve provider',
    });
  }
};

/**
 * Get provider availability
 * GET /api/providers/:id/availability
 */
export const getProviderAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { dateFrom, dateTo, timezone = 'UTC', duration = '30' } = req.query;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Provider ID is required',
      });
      return;
    }

    // Check if provider exists and is approved
    const provider = await prisma.provider.findUnique({
      where: { id },
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

    // If date range is provided, get available time slots
    if (dateFrom && dateTo) {
      logger.info(`🔍 Getting availability slots for provider ${id} from ${dateFrom} to ${dateTo}`);

      const { schedulingService } = await import('@/services/schedulingService');
      const startDate = new Date(dateFrom as string);
      const endDate = new Date(dateTo as string);
      const availabilityData = [];

      // Generate availability for each day in the range
      let currentDate = startDate;
      while (currentDate <= endDate) {
        const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

        try {
          const availableSlots = await schedulingService.getAvailableSlots({
            providerId: id,
            date: dateString as string,
            timezone: (timezone as string) || 'UTC',
            duration: parseInt((duration as string) || '30'),
          });

          // Transform slots to match frontend expectations
          const timeSlots = availableSlots.map(slot => ({
            time: slot.startTime ? slot.startTime.toISOString().split('T')[1]?.substring(0, 5) || '00:00' : '00:00', // HH:MM format
            available: slot.isAvailable,
            duration: parseInt((duration as string) || '30'),
          }));

          availabilityData.push({
            date: dateString,
            dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
            isAvailable: timeSlots.some(slot => slot.available),
            timeSlots,
          });
        } catch (error) {
          logger.error(`Error getting availability for ${dateString}:`, error);
          // Add empty day if there's an error
          availabilityData.push({
            date: dateString,
            dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
            isAvailable: false,
            timeSlots: [],
          });
        }

        // Move to next day
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }

      res.json({
        success: true,
        data: availabilityData,
        message: 'Provider availability slots retrieved successfully',
      });
    } else {
      // Return basic availability schedule (weekly pattern)
      const availability = await prisma.availability.findMany({
        where: { providerId: id },
        orderBy: {
          dayOfWeek: 'asc',
        },
      });

      res.json({
        success: true,
        data: availability,
        message: 'Provider availability schedule retrieved successfully',
      });
    }
  } catch (error) {
    logger.error('Get provider availability error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve provider availability',
    });
  }
};

/**
 * Update provider profile
 * PUT /api/providers/:id
 */
export const updateProvider = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      specialization,
      bio,
      education,
      experience,
      consultationFee,
    } = req.body;

    // Check if user is authorized to update this provider
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'Provider ID is required',
      });
      return;
    }

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        error: 'Provider not found',
      });
      return;
    }

    // Check authorization
    if (req.user.role !== 'ADMIN' && req.user.id !== provider.userId) {
      res.status(403).json({
        success: false,
        error: 'Not authorized to update this provider',
      });
      return;
    }

    const updateData: any = {
      specialization,
      bio,
      education,
      experience,
    };

    if (consultationFee !== undefined) {
      updateData.consultationFee = parseFloat(consultationFee);
    }

    const updatedProvider = await prisma.provider.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePicture: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedProvider,
      message: 'Provider updated successfully',
    });
  } catch (error) {
    logger.error('Update provider error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update provider',
    });
  }
};

/**
 * Get provider dashboard data
 * GET /api/providers/dashboard
 */
export const getProviderDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (req.user.role !== 'PROVIDER' && req.user.role !== 'DOCTOR') {
      res.status(403).json({
        success: false,
        error: 'Access denied. Provider role required.',
      });
      return;
    }

    logger.info(`📊 Getting dashboard data for provider: ${req.user.email}`);

    // Get provider record
    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.id },
      select: {
        id: true,
        specialization: true,
        consultationFee: true,
        isActive: true,
        isVerified: true,
        approvalStatus: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            profilePicture: true,
          },
        },
      },
    });

    if (!provider) {
      res.status(404).json({
        success: false,
        error: 'Provider profile not found',
      });
      return;
    }

    // Get today's date range
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // Get this week's date range
    const startOfWeek = subDays(today, 7);
    const endOfWeek = addDays(today, 7);

    // Get today's appointments
    const todaysAppointments = await prisma.appointment.findMany({
      where: {
        providerId: provider.id,
        appointmentDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      include: {
        patient: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDate: 'asc',
      },
    });

    // Get upcoming appointments (next 7 days)
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        providerId: provider.id,
        appointmentDate: {
          gt: endOfToday,
          lte: endOfWeek,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED'],
        },
      },
      include: {
        patient: {
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
      take: 10,
    });

    // Get recent patients
    const recentPatients = await prisma.appointment.findMany({
      where: {
        providerId: provider.id,
        status: 'COMPLETED',
      },
      include: {
        patient: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDate: 'desc',
      },
      take: 10,
      distinct: ['patientId'],
    });

    // Calculate statistics
    const uniquePatients = await prisma.appointment.findMany({
      where: {
        providerId: provider.id,
        status: 'COMPLETED',
      },
      select: {
        patientId: true,
      },
      distinct: ['patientId'],
    });
    const totalPatients = uniquePatients.length;

    const totalAppointments = await prisma.appointment.count({
      where: {
        providerId: provider.id,
      },
    });

    const completedAppointments = await prisma.appointment.count({
      where: {
        providerId: provider.id,
        status: 'COMPLETED',
      },
    });

    const thisWeekAppointments = await prisma.appointment.count({
      where: {
        providerId: provider.id,
        appointmentDate: {
          gte: startOfWeek,
          lte: endOfWeek,
        },
      },
    });

    // Get pending tasks (appointments needing attention)
    const pendingTasks = [];

    // Add appointments needing confirmation
    const unconfirmedAppointments = await prisma.appointment.count({
      where: {
        providerId: provider.id,
        status: 'SCHEDULED',
        appointmentDate: {
          gte: today,
        },
      },
    });

    if (unconfirmedAppointments > 0) {
      pendingTasks.push({
        type: 'appointments_to_confirm',
        count: unconfirmedAppointments,
        description: `${unconfirmedAppointments} appointment(s) need confirmation`,
        priority: 'medium',
      });
    }

    // Add overdue medical records
    // For now, use a simple count of overdue appointments
    // TODO: Implement proper medical records relationship check
    const overdueRecords = await prisma.appointment.count({
      where: {
        providerId: provider.id,
        status: 'COMPLETED',
        appointmentDate: {
          lt: subDays(today, 2), // Completed more than 2 days ago
        },
      },
    });

    if (overdueRecords > 0) {
      pendingTasks.push({
        type: 'medical_records_overdue',
        count: overdueRecords,
        description: `${overdueRecords} medical record(s) need to be completed`,
        priority: 'high',
      });
    }

    // Prepare dashboard data
    const dashboardData = {
      provider: {
        id: provider.id,
        name: provider.user.name,
        email: provider.user.email,
        phone: provider.user.phone,
        profilePicture: provider.user.profilePicture,
        specialization: provider.specialization,
        consultationFee: provider.consultationFee,
        isActive: provider.isActive,
        isVerified: provider.isVerified,
        approvalStatus: provider.approvalStatus,
      },
      todaysAppointments: todaysAppointments.map(appointment => ({
        id: appointment.id,
        date: appointment.appointmentDate,
        duration: appointment.duration,
        consultationType: appointment.consultationType,
        reason: appointment.reason,
        status: appointment.status,
        patient: {
          name: appointment.patient.user.name,
          email: appointment.patient.user.email,
          profilePicture: appointment.patient.user.profilePicture,
        },
      })),
      upcomingAppointments: upcomingAppointments.map(appointment => ({
        id: appointment.id,
        date: appointment.appointmentDate,
        duration: appointment.duration,
        consultationType: appointment.consultationType,
        reason: appointment.reason,
        status: appointment.status,
        patient: {
          name: appointment.patient.user.name,
        },
      })),
      recentPatients: recentPatients.map(appointment => ({
        patientId: appointment.patient.id,
        name: appointment.patient.user.name,
        email: appointment.patient.user.email,
        profilePicture: appointment.patient.user.profilePicture,
        lastVisit: appointment.appointmentDate,
      })),
      pendingTasks,
      statistics: {
        totalPatients,
        totalAppointments,
        completedAppointments,
        thisWeekAppointments,
        todaysAppointmentCount: todaysAppointments.length,
        upcomingAppointmentCount: upcomingAppointments.length,
      },
      patientSummary: {
        totalPatients,
        newPatientsThisWeek: recentPatients.filter(
          appointment => appointment.appointmentDate >= startOfWeek
        ).length,
        averageAppointmentsPerWeek: Math.round(thisWeekAppointments / 1) || 0,
      },
    };

    logger.info(`✅ Dashboard data retrieved for provider: ${provider.user.name}`);

    res.json({
      success: true,
      data: dashboardData,
      message: 'Provider dashboard data retrieved successfully',
    });
  } catch (error) {
    logger.error('Get provider dashboard error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard data',
    });
  }
};
