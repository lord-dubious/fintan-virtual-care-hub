import { PrismaClient } from '@prisma/client';
import NotificationAPI from 'notificationapi-node-client';

const prisma = new PrismaClient();

// Initialize NotificationAPI client
const notificationapi = new NotificationAPI({
  clientId: process.env.NOTIFICATION_API_CLIENT_ID!,
  clientSecret: process.env.NOTIFICATION_API_CLIENT_SECRET!,
});

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
  relatedId?: string;
  isRead?: boolean;
  link?: string;
}

export const notificationService = {
  // Create notification in database
  async createNotification(data: NotificationData): Promise<any> {
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

  // Get user notifications
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

  // Get unread count
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

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<any> {
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

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<any> {
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

  // Send notification via NotificationAPI
  async sendNotification(userId: string, templateId: string, data: any): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        console.error('User not found for notification');
        return false;
      }

      // Send notification using NotificationAPI
      await notificationapi.send({
        notificationId: templateId,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone || undefined,
        },
        mergeTags: data,
      });

      return true;
    } catch (error) {
      console.error('Error sending notification via NotificationAPI:', error);
      return false;
    }
  },

  // Appointment created notification
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

      const callType = appointment.consultationType === 'AUDIO' ? 'Audio' : 'Video';

      // Create in-app notification for patient
      await this.createNotification({
        title: `${callType} Appointment Scheduled`,
        message: `Your ${callType.toLowerCase()} appointment with ${appointment.provider.user.name} on ${new Date(appointment.appointmentDate).toLocaleString()} has been scheduled.`,
        type: NotificationType.APPOINTMENT_CREATED,
        userId: appointment.patient.userId,
        relatedId: appointmentId,
        link: `/patient/appointments/${appointmentId}`,
      });

      // Create in-app notification for provider
      await this.createNotification({
        title: `New ${callType} Appointment`,
        message: `${appointment.patient.user.name} has scheduled a ${callType.toLowerCase()} appointment with you on ${new Date(appointment.appointmentDate).toLocaleString()}.`,
        type: NotificationType.APPOINTMENT_CREATED,
        userId: appointment.provider.userId,
        relatedId: appointmentId,
        link: `/provider/appointments/${appointmentId}`,
      });

      // Send notification via NotificationAPI
      await this.sendNotification(
        appointment.patient.userId,
        'appointment_created',
        {
          patientName: appointment.patient.user.name,
          providerName: appointment.provider.user.name,
          appointmentDate: new Date(appointment.appointmentDate).toLocaleString(),
          appointmentType: callType,
          appointmentLink: `${process.env.NEXT_PUBLIC_APP_URL}/patient/appointments/${appointmentId}`,
        }
      );

      // Send notification to provider via NotificationAPI
      await this.sendNotification(
        appointment.provider.userId,
        'provider_new_appointment',
        {
          patientName: appointment.patient.user.name,
          providerName: appointment.provider.user.name,
          appointmentDate: new Date(appointment.appointmentDate).toLocaleString(),
          appointmentType: callType,
          appointmentLink: `${process.env.NEXT_PUBLIC_APP_URL}/provider/appointments/${appointmentId}`,
        }
      );
    } catch (error) {
      console.error('Error creating appointment notifications:', error);
    }
  },

  // Appointment reminder notification
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

      const callType = appointment.consultationType === 'AUDIO' ? 'Audio' : 'Video';

      // Create in-app notification for patient
      await this.createNotification({
        title: `${callType} Appointment Reminder`,
        message: `Your ${callType.toLowerCase()} appointment with ${appointment.provider.user.name} is scheduled for ${new Date(appointment.appointmentDate).toLocaleString()}.`,
        type: NotificationType.APPOINTMENT_REMINDER,
        userId: appointment.patient.userId,
        relatedId: appointmentId,
        link: `/patient/appointments/${appointmentId}`,
      });

      // Create in-app notification for provider
      await this.createNotification({
        title: `${callType} Appointment Reminder`,
        message: `You have a ${callType.toLowerCase()} appointment with ${appointment.patient.user.name} scheduled for ${new Date(appointment.appointmentDate).toLocaleString()}.`,
        type: NotificationType.APPOINTMENT_REMINDER,
        userId: appointment.provider.userId,
        relatedId: appointmentId,
        link: `/provider/appointments/${appointmentId}`,
      });

      // Send reminder to patient via NotificationAPI
      await this.sendNotification(
        appointment.patient.userId,
        'appointment_reminder',
        {
          patientName: appointment.patient.user.name,
          providerName: appointment.provider.user.name,
          appointmentDate: new Date(appointment.appointmentDate).toLocaleString(),
          appointmentType: callType,
          appointmentLink: `${process.env.NEXT_PUBLIC_APP_URL}/patient/appointments/${appointmentId}`,
        }
      );

      // Send reminder to provider via NotificationAPI
      await this.sendNotification(
        appointment.provider.userId,
        'provider_appointment_reminder',
        {
          patientName: appointment.patient.user.name,
          providerName: appointment.provider.user.name,
          appointmentDate: new Date(appointment.appointmentDate).toLocaleString(),
          appointmentType: callType,
          appointmentLink: `${process.env.NEXT_PUBLIC_APP_URL}/provider/appointments/${appointmentId}`,
        }
      );
    } catch (error) {
      console.error('Error creating appointment reminder notifications:', error);
    }
  },

  // Consultation started notification
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
      const callType = appointment.consultationType === 'AUDIO' ? 'Audio' : 'Video';

      // Create in-app notification for patient
      await this.createNotification({
        title: `${callType} Consultation Started`,
        message: `Your ${callType.toLowerCase()} consultation with ${appointment.provider.user.name} has started. Join now!`,
        type: NotificationType.CONSULTATION_STARTED,
        userId: appointment.patient.userId,
        relatedId: consultationId,
        link: `/consultation/${consultationId}`,
      });

      // Create in-app notification for provider
      await this.createNotification({
        title: `${callType} Consultation Started`,
        message: `Your ${callType.toLowerCase()} consultation with ${appointment.patient.user.name} has started. Join now!`,
        type: NotificationType.CONSULTATION_STARTED,
        userId: appointment.provider.userId,
        relatedId: consultationId,
        link: `/consultation/${consultationId}`,
      });

      // Send urgent notification to patient via NotificationAPI
      await this.sendNotification(
        appointment.patient.userId,
        'consultation_started',
        {
          patientName: appointment.patient.user.name,
          providerName: appointment.provider.user.name,
          consultationType: callType,
          consultationLink: `${process.env.NEXT_PUBLIC_APP_URL}/consultation/${consultationId}`,
        }
      );

      // Send urgent notification to provider via NotificationAPI
      await this.sendNotification(
        appointment.provider.userId,
        'provider_consultation_started',
        {
          patientName: appointment.patient.user.name,
          providerName: appointment.provider.user.name,
          consultationType: callType,
          consultationLink: `${process.env.NEXT_PUBLIC_APP_URL}/consultation/${consultationId}`,
        }
      );
    } catch (error) {
      console.error('Error creating consultation started notifications:', error);
    }
  },
};

