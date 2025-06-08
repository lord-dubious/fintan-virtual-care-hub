import { PrismaClient } from '@prisma/client';
import { useToast } from '@/hooks/use-toast';

const prisma = new PrismaClient();

export enum NotificationType {
  APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
  APPOINTMENT_UPDATED = 'APPOINTMENT_UPDATED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  CONSULTATION_STARTED = 'CONSULTATION_STARTED',
  CONSULTATION_ENDED = 'CONSULTATION_ENDED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  SYSTEM = 'SYSTEM',
}

export interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  userId: string;
  relatedId?: string; // ID of related entity (appointment, consultation, etc.)
  isRead?: boolean;
  link?: string; // Optional link to navigate to when notification is clicked
}

export interface NotificationResult {
  success: boolean;
  notification?: any;
  message?: string;
}

export const notificationService = {
  async createNotification(data: NotificationData): Promise<NotificationResult> {
    try {
      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          userId: data.userId,
          relatedId: data.relatedId,
          isRead: data.isRead || false,
          link: data.link,
        },
      });

      return {
        success: true,
        notification,
      };
    } catch (error) {
      console.error('Error creating notification:', error);
      return {
        success: false,
        message: 'Failed to create notification',
      };
    }
  },

  async getUserNotifications(userId: string, limit = 20, offset = 0): Promise<any[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      console.error('Error counting unread notifications:', error);
      return 0;
    }
  },

  async markAsRead(notificationId: string): Promise<NotificationResult> {
    try {
      const notification = await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          isRead: true,
        },
      });

      return {
        success: true,
        notification,
      };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        message: 'Failed to mark notification as read',
      };
    }
  },

  async markAllAsRead(userId: string): Promise<NotificationResult> {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return {
        success: false,
        message: 'Failed to mark all notifications as read',
      };
    }
  },

  async deleteNotification(notificationId: string): Promise<NotificationResult> {
    try {
      await prisma.notification.delete({
        where: {
          id: notificationId,
        },
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return {
        success: false,
        message: 'Failed to delete notification',
      };
    }
  },

  // Helper function to show toast notification
  showToast(data: { title: string; description: string; variant?: 'default' | 'destructive' }) {
    const { toast } = useToast();
    toast({
      title: data.title,
      description: data.description,
      variant: data.variant || 'default',
    });
  },

  // Create appointment notification
  async notifyAppointmentCreated(appointmentId: string): Promise<void> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
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
      });

      if (!appointment) return;

      // Notify patient
      await this.createNotification({
        title: 'Appointment Scheduled',
        message: `Your appointment with ${appointment.provider.user.name} on ${new Date(appointment.appointmentDate).toLocaleString()} has been scheduled.`,
        type: NotificationType.APPOINTMENT_CREATED,
        userId: appointment.patient.userId,
        relatedId: appointmentId,
        link: `/patient/appointments/${appointmentId}`,
      });

      // Notify provider
      await this.createNotification({
        title: 'New Appointment',
        message: `${appointment.patient.user.name} has scheduled an appointment with you on ${new Date(appointment.appointmentDate).toLocaleString()}.`,
        type: NotificationType.APPOINTMENT_CREATED,
        userId: appointment.provider.userId,
        relatedId: appointmentId,
        link: `/provider/appointments/${appointmentId}`,
      });
    } catch (error) {
      console.error('Error creating appointment notifications:', error);
    }
  },

  // Create appointment reminder notification
  async notifyAppointmentReminder(appointmentId: string): Promise<void> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
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
      });

      if (!appointment) return;

      // Notify patient
      await this.createNotification({
        title: 'Appointment Reminder',
        message: `Your appointment with ${appointment.provider.user.name} is scheduled for ${new Date(appointment.appointmentDate).toLocaleString()}.`,
        type: NotificationType.APPOINTMENT_REMINDER,
        userId: appointment.patient.userId,
        relatedId: appointmentId,
        link: `/patient/appointments/${appointmentId}`,
      });

      // Notify provider
      await this.createNotification({
        title: 'Appointment Reminder',
        message: `You have an appointment with ${appointment.patient.user.name} scheduled for ${new Date(appointment.appointmentDate).toLocaleString()}.`,
        type: NotificationType.APPOINTMENT_REMINDER,
        userId: appointment.provider.userId,
        relatedId: appointmentId,
        link: `/provider/appointments/${appointmentId}`,
      });
    } catch (error) {
      console.error('Error creating appointment reminder notifications:', error);
    }
  },

  // Create consultation started notification
  async notifyConsultationStarted(consultationId: string): Promise<void> {
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

      if (!consultation) return;

      const appointment = consultation.appointment;

      // Notify patient
      await this.createNotification({
        title: 'Consultation Started',
        message: `Your consultation with ${appointment.provider.user.name} has started. Join now!`,
        type: NotificationType.CONSULTATION_STARTED,
        userId: appointment.patient.userId,
        relatedId: consultationId,
        link: `/consultation/${consultationId}`,
      });

      // Notify provider
      await this.createNotification({
        title: 'Consultation Started',
        message: `Your consultation with ${appointment.patient.user.name} has started. Join now!`,
        type: NotificationType.CONSULTATION_STARTED,
        userId: appointment.provider.userId,
        relatedId: consultationId,
        link: `/consultation/${consultationId}`,
      });
    } catch (error) {
      console.error('Error creating consultation started notifications:', error);
    }
  },
};

