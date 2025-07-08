import { prisma } from '@/config/database';
import logger from '@/config/logger';

export interface ActivityLogData {
  userId: string;
  action: string;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class ActivityLogService {
  private static instance: ActivityLogService;

  static getInstance(): ActivityLogService {
    if (!ActivityLogService.instance) {
      ActivityLogService.instance = new ActivityLogService();
    }
    return ActivityLogService.instance;
  }

  /**
   * Log user activity
   */
  async logActivity(data: ActivityLogData): Promise<void> {
    try {
      await prisma.activityLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          description: data.description,
          metadata: data.metadata || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          createdAt: new Date(),
        },
      });

      logger.info(`📝 Activity logged: ${data.action} for user ${data.userId}`);
    } catch (error) {
      logger.error('Failed to log activity:', error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  /**
   * Log authentication events
   */
  async logAuth(userId: string, action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED', metadata?: Record<string, any>, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logActivity({
      userId,
      action: `AUTH_${action}`,
      description: `User ${action.toLowerCase().replace('_', ' ')}`,
      metadata: {
        ...metadata,
        category: 'authentication',
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log appointment events
   */
  async logAppointment(userId: string, action: 'CREATED' | 'UPDATED' | 'CANCELLED' | 'COMPLETED', appointmentId: string, metadata?: Record<string, any>): Promise<void> {
    await this.logActivity({
      userId,
      action: `APPOINTMENT_${action}`,
      description: `Appointment ${action.toLowerCase()}`,
      metadata: {
        appointmentId,
        ...metadata,
        category: 'appointment',
      },
    });
  }

  /**
   * Log medical record events
   */
  async logMedicalRecord(userId: string, action: 'CREATED' | 'UPDATED' | 'VIEWED' | 'DELETED', recordId: string, patientId?: string): Promise<void> {
    await this.logActivity({
      userId,
      action: `MEDICAL_RECORD_${action}`,
      description: `Medical record ${action.toLowerCase()}`,
      metadata: {
        recordId,
        patientId,
        category: 'medical_record',
      },
    });
  }

  /**
   * Log profile events
   */
  async logProfile(userId: string, action: 'UPDATED' | 'VIEWED', metadata?: Record<string, any>): Promise<void> {
    await this.logActivity({
      userId,
      action: `PROFILE_${action}`,
      description: `Profile ${action.toLowerCase()}`,
      metadata: {
        ...metadata,
        category: 'profile',
      },
    });
  }

  /**
   * Log payment events
   */
  async logPayment(userId: string, action: 'INITIATED' | 'COMPLETED' | 'FAILED' | 'REFUNDED', amount: number, appointmentId?: string): Promise<void> {
    await this.logActivity({
      userId,
      action: `PAYMENT_${action}`,
      description: `Payment ${action.toLowerCase()}`,
      metadata: {
        amount,
        appointmentId,
        category: 'payment',
      },
    });
  }

  /**
   * Log consultation events
   */
  async logConsultation(userId: string, action: 'STARTED' | 'ENDED' | 'JOINED' | 'LEFT', consultationId: string, duration?: number): Promise<void> {
    await this.logActivity({
      userId,
      action: `CONSULTATION_${action}`,
      description: `Consultation ${action.toLowerCase()}`,
      metadata: {
        consultationId,
        duration,
        category: 'consultation',
      },
    });
  }

  /**
   * Log data access events (for privacy compliance)
   */
  async logDataAccess(userId: string, action: 'VIEWED' | 'DOWNLOADED' | 'SHARED', dataType: string, targetUserId?: string): Promise<void> {
    await this.logActivity({
      userId,
      action: `DATA_${action}`,
      description: `${dataType} data ${action.toLowerCase()}`,
      metadata: {
        dataType,
        targetUserId,
        category: 'data_access',
        privacy: true, // Mark as privacy-related
      },
    });
  }

  /**
   * Log security events
   */
  async logSecurity(userId: string, action: 'PASSWORD_CHANGED' | 'EMAIL_CHANGED' | 'SUSPICIOUS_ACTIVITY' | 'ACCOUNT_LOCKED', metadata?: Record<string, any>, ipAddress?: string): Promise<void> {
    await this.logActivity({
      userId,
      action: `SECURITY_${action}`,
      description: `Security event: ${action.toLowerCase().replace('_', ' ')}`,
      metadata: {
        ...metadata,
        category: 'security',
        severity: action === 'SUSPICIOUS_ACTIVITY' || action === 'ACCOUNT_LOCKED' ? 'high' : 'medium',
      },
      ipAddress,
    });
  }

  /**
   * Get user activity logs with filtering
   */
  async getUserActivity(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      category?: string;
      action?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {}
  ): Promise<{ activities: any[]; total: number }> {
    const {
      limit = 50,
      offset = 0,
      category,
      action,
      dateFrom,
      dateTo,
    } = options;

    const where: any = { userId };

    if (category) {
      where.metadata = {
        path: ['category'],
        equals: category,
      };
    }

    if (action) {
      where.action = { contains: action, mode: 'insensitive' };
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return { activities, total };
  }

  /**
   * Clean up old activity logs (for data retention compliance)
   */
  async cleanupOldLogs(retentionDays: number = 365): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const result = await prisma.activityLog.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
          // Keep security and privacy-related logs longer
          metadata: {
            path: ['category'],
            not: { in: ['security', 'data_access'] },
          },
        },
      });

      logger.info(`🧹 Cleaned up ${result.count} old activity logs older than ${retentionDays} days`);
      return result.count;
    } catch (error) {
      logger.error('Failed to cleanup old activity logs:', error);
      return 0;
    }
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(userId: string, days: number = 30): Promise<Record<string, number>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await prisma.activityLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        action: true,
        metadata: true,
      },
    });

    const stats: Record<string, number> = {};

    activities.forEach(activity => {
      const category = activity.metadata?.category || 'other';
      stats[category] = (stats[category] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const activityLogService = ActivityLogService.getInstance();
