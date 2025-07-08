import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import logger from '@/config/logger';
import { AuthenticatedRequest } from '@/types';
import { activityLogService } from '@/services/activityLogService';
import { z } from 'zod';
import { startOfDay, endOfDay, parseISO, subDays } from 'date-fns';

// Validation schemas
const activityQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 100) : 20),
  category: z.string().optional(),
  action: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  days: z.string().optional().transform(val => val ? parseInt(val) : 30),
});

const logActivitySchema = z.object({
  action: z.string().min(1, 'Action is required'),
  description: z.string().min(1, 'Description is required'),
  metadata: z.record(z.any()).optional(),
});

interface ActivityItem {
  id: string;
  type: 'appointment' | 'prescription' | 'message' | 'payment' | 'record' | 'consultation';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'info' | 'error';
  actionable?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Get patient activities from various sources
 * Combines notifications, appointments, payments, etc. into a unified activity feed
 */
export const getPatientActivities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Get user's patient record
    const patient = await prisma.patient.findUnique({
      where: { userId },
      select: { id: true }
    });

    if (!patient) {
      res.status(404).json({
        success: false,
        error: 'Patient record not found'
      });
      return;
    }

    const activities: ActivityItem[] = [];

    // Get recent notifications
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        isRead: true,
        createdAt: true
      }
    });

    // Transform notifications to activities
    notifications.forEach(notification => {
      activities.push({
        id: notification.id,
        type: notification.type.toLowerCase() as any,
        title: notification.title,
        description: notification.message,
        timestamp: notification.createdAt,
        status: notification.isRead ? 'info' : 'warning',
        actionable: !notification.isRead,
        metadata: { notificationId: notification.id }
      });
    });

    // Get recent appointments
    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      orderBy: { appointmentDate: 'desc' },
      take: 5,
      select: {
        id: true,
        appointmentDate: true,
        reason: true,
        status: true,
        createdAt: true,
        provider: {
          select: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Transform appointments to activities
    appointments.forEach(appointment => {
      const providerName = appointment.provider?.user?.name || 'Dr. Fintan';
      activities.push({
        id: appointment.id,
        type: 'appointment',
        title: `Appointment ${appointment.status.toLowerCase()}`,
        description: `${appointment.reason || 'Consultation'} with ${providerName}`,
        timestamp: appointment.createdAt,
        status: appointment.status === 'CONFIRMED' ? 'success' : 'info',
        actionable: appointment.status === 'SCHEDULED',
        metadata: {
          appointmentId: appointment.id,
          appointmentDate: appointment.appointmentDate,
          provider: providerName
        }
      });
    });

    // Get recent activity logs
    const activityLogs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        action: true,
        title: true,
        description: true,
        entityType: true,
        entityId: true,
        metadata: true,
        createdAt: true
      }
    });

    // Transform activity logs to activities
    activityLogs.forEach((log: any) => {
      activities.push({
        id: log.id,
        type: log.entityType as any,
        title: log.title,
        description: log.description || '',
        timestamp: log.createdAt,
        status: 'info',
        actionable: false,
        metadata: log.metadata as any
      });
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Limit to most recent 20 activities
    const recentActivities = activities.slice(0, 20);

    res.json({
      success: true,
      data: recentActivities
    });

  } catch (error) {
    console.error('Error fetching patient activities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patient activities'
    });
  }
};

/**
 * Create a new activity log entry
 */
export const createActivityLog = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const { action, entityType, entityId, title, description, metadata } = req.body;

    if (!action || !entityType || !title) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: action, entityType, title'
      });
      return;
    }

    const activityLog = await prisma.activityLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        title,
        description,
        metadata: metadata || {}
      }
    });

    res.status(201).json({
      success: true,
      data: activityLog
    });

  } catch (error) {
    console.error('Error creating activity log:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create activity log'
    });
  }
};

/**
 * Get activity statistics for dashboard
 */
export const getActivityStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    // Get counts for different activity types
    const [
      notificationCount,
      appointmentCount,
      activityLogCount
    ] = await Promise.all([
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.appointment.count({ 
        where: { 
          patient: { userId },
          status: 'SCHEDULED'
        } 
      }),
      prisma.activityLog.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        unreadNotifications: notificationCount,
        upcomingAppointments: appointmentCount,
        recentActivities: activityLogCount
      }
    });

  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity statistics'
    });
  }
};

/**
 * Get enhanced user activity logs
 * GET /api/activity/logs
 */
export const getActivityLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const queryParams = activityQuerySchema.parse(req.query);
    const { page, limit, category, action, dateFrom, dateTo, days } = queryParams;

    // Calculate date range
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (dateFrom) {
      startDate = startOfDay(parseISO(dateFrom));
    } else {
      startDate = subDays(new Date(), days);
    }

    if (dateTo) {
      endDate = endOfDay(parseISO(dateTo));
    }

    const { activities, total } = await activityLogService.getUserActivity(req.user.id, {
      limit,
      offset: (page - 1) * limit,
      category,
      action,
      dateFrom: startDate,
      dateTo: endDate,
    });

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
        filters: { category, action, dateFrom, dateTo, days },
      },
      message: `Retrieved ${activities.length} activity logs`,
    });
  } catch (error) {
    logger.error('Get activity logs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve activity logs',
    });
  }
};

/**
 * Log custom activity
 * POST /api/activity/log
 */
export const logCustomActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const validatedData = logActivitySchema.parse(req.body);
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    await activityLogService.logActivity({
      userId: req.user.id,
      action: validatedData.action,
      description: validatedData.description,
      metadata: validatedData.metadata,
      ipAddress,
      userAgent,
    });

    res.status(201).json({
      success: true,
      message: 'Activity logged successfully',
    });
  } catch (error) {
    logger.error('Log custom activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log activity',
    });
  }
};

/**
 * Get activity statistics
 * GET /api/activity/statistics
 */
export const getEnhancedActivityStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    const { days = '30' } = req.query;
    const dayCount = parseInt(days as string);

    const stats = await activityLogService.getActivityStats(req.user.id, dayCount);

    res.json({
      success: true,
      data: {
        stats,
        period: `${dayCount} days`,
        totalActivities: Object.values(stats).reduce((sum, count) => sum + count, 0),
      },
      message: 'Activity statistics retrieved successfully',
    });
  } catch (error) {
    logger.error('Get enhanced activity stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve activity statistics',
    });
  }
};
