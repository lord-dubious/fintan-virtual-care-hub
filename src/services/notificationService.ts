
// NotificationAPI Integration Service
export interface NotificationConfig {
  clientId: string;
  apiKey?: string; // Will be set by user initially
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

export interface ScheduledNotification {
  id: string;
  appointmentId: string;
  type: 'reminder' | 'confirmation' | 'followup';
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed';
}

class NotificationService {
  private config: NotificationConfig | null = null;
  private baseUrl = 'https://api.notificationapi.com';

  initialize(config: NotificationConfig) {
    this.config = config;
    console.log('NotificationAPI initialized with client:', config.clientId);
  }

  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.config?.apiKey) {
      console.warn('NotificationAPI not configured with API key');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Client-Id': this.config.clientId
        },
        body: JSON.stringify({
          notification: {
            title: payload.title,
            body: payload.body,
            actionUrl: payload.actionUrl
          },
          user: {
            id: payload.userId
          },
          channels: payload.channels,
          templateId: payload.templateId,
          templateParams: payload.templateParams,
          scheduledFor: payload.scheduledFor?.toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`NotificationAPI error: ${response.status}`);
      }

      console.log('Notification sent successfully:', payload.notificationId);
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  async scheduleAppointmentReminders(appointmentId: string, appointmentDate: Date, patientEmail: string, patientPhone?: string): Promise<ScheduledNotification[]> {
    const notifications: ScheduledNotification[] = [];
    const channels: ('email' | 'sms')[] = ['email'];
    
    if (patientPhone) {
      channels.push('sms');
    }

    // 24 hours before reminder
    const reminder24h: ScheduledNotification = {
      id: `reminder_24h_${appointmentId}`,
      appointmentId,
      type: 'reminder',
      scheduledFor: new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000),
      status: 'pending'
    };

    // 1 hour before reminder
    const reminder1h: ScheduledNotification = {
      id: `reminder_1h_${appointmentId}`,
      appointmentId,
      type: 'reminder', 
      scheduledFor: new Date(appointmentDate.getTime() - 60 * 60 * 1000),
      status: 'pending'
    };

    // Schedule 24-hour reminder
    await this.sendNotification({
      notificationId: reminder24h.id,
      userId: patientEmail,
      title: 'Appointment Reminder - Tomorrow',
      body: 'You have a consultation with Dr. Fintan Ekochin scheduled for tomorrow.',
      actionUrl: '/booking/confirmation',
      scheduledFor: reminder24h.scheduledFor,
      channels,
      templateId: 'appointment_reminder_24h'
    });

    // Schedule 1-hour reminder
    await this.sendNotification({
      notificationId: reminder1h.id,
      userId: patientEmail,
      title: 'Appointment Starting Soon',
      body: 'Your consultation with Dr. Fintan Ekochin starts in 1 hour.',
      actionUrl: '/consultation/join',
      scheduledFor: reminder1h.scheduledFor,
      channels,
      templateId: 'appointment_reminder_1h'
    });

    notifications.push(reminder24h, reminder1h);
    return notifications;
  }

  async sendAppointmentConfirmation(appointmentId: string, patientEmail: string, appointmentDetails: any): Promise<boolean> {
    return await this.sendNotification({
      notificationId: `confirmation_${appointmentId}`,
      userId: patientEmail,
      title: 'Appointment Confirmed',
      body: `Your consultation with Dr. Fintan Ekochin has been confirmed for ${appointmentDetails.date} at ${appointmentDetails.time}.`,
      actionUrl: '/booking/confirmation',
      channels: ['email', 'in_app'],
      templateId: 'appointment_confirmation',
      templateParams: appointmentDetails
    });
  }

  async cancelScheduledNotification(notificationId: string): Promise<boolean> {
    if (!this.config?.apiKey) {
      console.warn('NotificationAPI not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Client-Id': this.config.clientId
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to cancel notification:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
