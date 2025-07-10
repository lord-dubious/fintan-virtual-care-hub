import { PrismaClient, Notification } from '@prisma/client';
import { ApiResponse, NotificationData, NotificationType } from '../../../shared/domain';
import { logger } from '../utils/monitoring';

const prisma = new PrismaClient();

export const notificationService = {
  async createNotification(data: Omit<NotificationData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Notification>> {
    try {
      const notification = await prisma.notification.create({
        data: {
          title: data.title,
          message: data.message,
          type: data.type,
          userId: data.userId,
          relatedId: data.relatedId || null,
          link: data.link || null,
          isRead: data.isRead,
        },
      });
      return { success: true, data: notification };
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to create notification', errorData);
      return { success: false, error: 'Failed to create notification' };
    }
  },

  async getUserNotifications(userId: string, limit = 20, offset = 0): Promise<ApiResponse<Notification[]>> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });
      return { success: true, data: notifications };
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to fetch notifications', errorData);
      return { success: false, error: 'Failed to fetch notifications' };
    }
  },

  async getUnreadCount(userId: string): Promise<ApiResponse<number>> {
    try {
      const count = await prisma.notification.count({
        where: { userId, isRead: false },
      });
      return { success: true, data: count };
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to count unread notifications', errorData);
      return { success: false, error: 'Failed to count unread notifications' };
    }
  },

  async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    try {
      const notification = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });
      return { success: true, data: notification };
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to mark notification as read', errorData);
      return { success: false, error: 'Failed to mark notification as read' };
    }
  },

  async markAllAsRead(userId: string): Promise<ApiResponse<null>> {
    try {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
      return { success: true, data: null };
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to mark all notifications as read', errorData);
      return { success: false, error: 'Failed to mark all notifications as read' };
    }
  },

  async sendNotification(userId: string, templateId: string, data: Record<string, unknown>): Promise<ApiResponse<boolean>> {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // TODO: Fix NotificationAPI integration
      // await notificationapi.send({
      //   notificationId: templateId,
      // });
      logger.info('Notification would be sent:', { templateId, userId, data });

      return { success: true, data: true };
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to send notification', errorData);
      return { success: false, error: 'Failed to send notification' };
    }
  },

  async notifyAppointmentCreated(appointmentId: string): Promise<void> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: { include: { user: true } },
          provider: { include: { user: true } },
        },
      });

      if (!appointment) return;

      const callType = appointment.consultationType;
      const patientName = appointment.patient?.user?.name;
      const providerName = appointment.provider?.user?.name;
      const appointmentDate = new Date(appointment.appointmentDate).toLocaleString();

      await this.createNotification({
        title: `${callType} Appointment Scheduled`,
        message: `Your appointment with ${providerName} on ${appointmentDate} has been scheduled.`,
        type: NotificationType.APPOINTMENT_CREATED,
        userId: appointment.patient.userId,
        relatedId: appointmentId,
        link: `/patient/appointments/${appointmentId}`,
        isRead: false,
      });

      await this.createNotification({
        title: `New ${callType} Appointment`,
        message: `${patientName} has scheduled a ${callType.toLowerCase()} appointment with you on ${appointmentDate}.`,
        type: NotificationType.APPOINTMENT_CREATED,
        userId: appointment.provider.userId,
        relatedId: appointmentId,
        link: `/provider/appointments/${appointmentId}`,
        isRead: false,
      });

      const notificationData = {
        patientName,
        providerName,
        appointmentDate,
        appointmentType: callType,
        appointmentLink: `${process.env.NEXT_PUBLIC_APP_URL}/patient/appointments/${appointmentId}`,
      };

      await this.sendNotification(appointment.patient.userId, 'appointment_created', notificationData);
      await this.sendNotification(appointment.provider.userId, 'provider_new_appointment', { ...notificationData, appointmentLink: `${process.env.NEXT_PUBLIC_APP_URL}/provider/appointments/${appointmentId}` });
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Error creating appointment notifications:', errorData);
    }
  },

  async notifyAppointmentReminder(appointmentId: string): Promise<void> {
    try {
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
              patient: { include: { user: true } },
              provider: { include: { user: true } },
            },
          });
    
          if (!appointment) return;
    
          const callType = appointment.consultationType;
          const patientName = appointment.patient?.user?.name;
          const providerName = appointment.provider?.user?.name;
          const appointmentDate = new Date(appointment.appointmentDate).toLocaleString();

          await this.createNotification({
            title: `${callType} Appointment Reminder`,
            message: `Your appointment with ${providerName} is on ${appointmentDate}.`,
            type: NotificationType.APPOINTMENT_REMINDER,
            userId: appointment.patient.userId,
            relatedId: appointmentId,
            link: `/patient/appointments/${appointmentId}`,
            isRead: false,
          });

          await this.createNotification({
            title: `${callType} Appointment Reminder`,
            message: `Your appointment with ${patientName} is on ${appointmentDate}.`,
            type: NotificationType.APPOINTMENT_REMINDER,
            userId: appointment.provider.userId,
            relatedId: appointmentId,
            link: `/provider/appointments/${appointmentId}`,
            isRead: false,
          });

          const notificationData = {
            patientName,
            providerName,
            appointmentDate,
            appointmentType: callType,
            appointmentLink: `${process.env.NEXT_PUBLIC_APP_URL}/patient/appointments/${appointmentId}`,
          };

          await this.sendNotification(appointment.patient.userId, 'appointment_reminder', notificationData);
          await this.sendNotification(appointment.provider.userId, 'provider_appointment_reminder', { ...notificationData, appointmentLink: `${process.env.NEXT_PUBLIC_APP_URL}/provider/appointments/${appointmentId}` });
    } catch (error: unknown) {
        const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
        logger.error('Error creating appointment reminder notifications:', errorData);
    }
  },

  async notifyConsultationStarted(consultationId: string): Promise<void> {
    try {
      const consultation = await prisma.consultation.findUnique({
        where: { id: consultationId },
        include: {
          appointment: {
            include: {
              patient: { include: { user: true } },
              provider: { include: { user: true } },
            },
          },
        },
      });

      if (!consultation || !consultation.appointment) return;

      const { appointment } = consultation;
      const callType = appointment.consultationType;
      const patientName = appointment.patient?.user?.name;
      const providerName = appointment.provider?.user?.name;

      await this.createNotification({
        title: `${callType} Consultation Started`,
        message: `Your consultation with ${providerName} has started. Join now!`,
        type: NotificationType.CONSULTATION_STARTED,
        userId: appointment.patient.userId,
        relatedId: consultationId,
        link: `/consultation/${consultationId}`,
        isRead: false,
      });

      await this.createNotification({
        title: `${callType} Consultation Started`,
        message: `Your consultation with ${patientName} has started. Join now!`,
        type: NotificationType.CONSULTATION_STARTED,
        userId: appointment.provider.userId,
        relatedId: consultationId,
        link: `/consultation/${consultationId}`,
        isRead: false,
      });

      const notificationData = {
        patientName,
        providerName,
        consultationType: callType,
        consultationLink: `${process.env.NEXT_PUBLIC_APP_URL}/consultation/${consultationId}`,
      };

      await this.sendNotification(appointment.patient.userId, 'consultation_started', notificationData);
      await this.sendNotification(appointment.provider.userId, 'provider_consultation_started', notificationData);

    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Error creating consultation started notifications:', errorData);
    }
  },
};
