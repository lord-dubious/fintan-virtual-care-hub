
// NotificationAPI Integration Service with proper Lovable integration
export interface NotificationConfig {
  clientId: string;
  userId: string;
}

export interface NotificationPayload {
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  actionUrl?: string;
  scheduledFor?: Date;
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  templateId?: string;
  templateParams?: Record<string, any>;
}

class NotificationService {
  private config: NotificationConfig | null = null;
  private notificationapi: any = null;

  initialize(config: NotificationConfig) {
    this.config = config;
    
    // Initialize NotificationAPI according to their documentation
    if (typeof window !== 'undefined') {
      // Load NotificationAPI script
      const script = document.createElement('script');
      script.src = 'https://notificationapi.com/sdk/notificationapi.js';
      script.onload = () => {
        this.notificationapi = (window as any).notificationapi?.init({
          clientId: config.clientId,
          userId: config.userId,
        });
      };
      document.head.appendChild(script);
    }
    
    console.log('NotificationAPI initialized with client:', config.clientId);
  }

  async sendNotification(payload: NotificationPayload): Promise<{ success: boolean; id?: string }> {
    if (!this.notificationapi) {
      console.warn('NotificationAPI not initialized');
      return { success: false };
    }

    try {
      const result = await this.notificationapi.send({
        notificationId: payload.templateId || 'default_template',
        user: {
          id: payload.userId,
          email: payload.userId
        },
        mergeTags: {
          title: payload.title,
          message: payload.body,
          actionUrl: payload.actionUrl,
          ...payload.templateParams
        }
      });

      console.log('Notification sent successfully:', result);
      return { success: true, id: result.id };
    } catch (error) {
      console.error('Failed to send notification:', error);
      return { success: false };
    }
  }

  async scheduleAppointmentReminders(
    appointmentId: string, 
    appointmentDate: Date, 
    patientEmail: string, 
    patientPhone?: string,
    doctorName: string = 'Dr. Fintan Ekochin'
  ): Promise<any[]> {
    const notifications: any[] = [];

    try {
      // 24 hours before reminder
      const result24h = await this.sendNotification({
        notificationId: `reminder_24h_${appointmentId}`,
        userId: patientEmail,
        title: `Appointment Reminder - Tomorrow`,
        body: `You have a consultation with ${doctorName} scheduled for tomorrow at ${appointmentDate.toLocaleTimeString()}.`,
        actionUrl: `/booking/confirmation?id=${appointmentId}`,
        channels: ['email'],
        templateId: 'appointment_reminder_24h',
        templateParams: {
          doctorName,
          appointmentDate: appointmentDate.toLocaleDateString(),
          appointmentTime: appointmentDate.toLocaleTimeString()
        }
      });

      if (result24h.success) {
        notifications.push({
          id: `reminder_24h_${appointmentId}`,
          appointmentId,
          type: 'reminder',
          scheduledFor: new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000),
          status: 'pending'
        });
      }

      // 1 hour before reminder
      const result1h = await this.sendNotification({
        notificationId: `reminder_1h_${appointmentId}`,
        userId: patientEmail,
        title: `Appointment Starting Soon`,
        body: `Your consultation with ${doctorName} starts in 1 hour.`,
        actionUrl: `/consultation/join?id=${appointmentId}`,
        channels: ['email'],
        templateId: 'appointment_reminder_1h'
      });

      if (result1h.success) {
        notifications.push({
          id: `reminder_1h_${appointmentId}`,
          appointmentId,
          type: 'reminder',
          scheduledFor: new Date(appointmentDate.getTime() - 60 * 60 * 1000),
          status: 'pending'
        });
      }
    } catch (error) {
      console.error('Failed to schedule appointment reminders:', error);
    }

    return notifications;
  }

  async sendAppointmentConfirmation(
    appointmentId: string, 
    patientEmail: string, 
    appointmentDetails: {
      date: string;
      time: string;
      type: string;
      doctorName?: string;
    }
  ): Promise<boolean> {
    const result = await this.sendNotification({
      notificationId: `confirmation_${appointmentId}`,
      userId: patientEmail,
      title: 'Appointment Confirmed ✅',
      body: `Your ${appointmentDetails.type} with ${appointmentDetails.doctorName || 'Dr. Fintan Ekochin'} has been confirmed for ${appointmentDetails.date} at ${appointmentDetails.time}.`,
      actionUrl: `/booking/confirmation?id=${appointmentId}`,
      channels: ['email'],
      templateId: 'appointment_confirmation',
      templateParams: appointmentDetails
    });

    return result.success;
  }
}

export const notificationService = new NotificationService();
