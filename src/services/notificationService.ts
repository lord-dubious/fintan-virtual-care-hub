
// NotificationAPI Integration Service with real scheduling
export interface NotificationConfig {
  clientId: string;
  apiKey?: string;
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
  templateParams?: Record<string, unknown>;
}

export interface ScheduledNotification {
  id: string;
  appointmentId: string;
  type: 'reminder' | 'confirmation' | 'followup';
  scheduledFor: Date;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  notificationApiId?: string;
}

export interface ApiScheduledNotification {
  id: string;
  notificationId: string;
  userId: string;
  scheduledDate: string;
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

class NotificationService {
  private config: NotificationConfig | null = null;
  private baseUrl = 'https://api.notificationapi.com/v1';

  initialize(config: NotificationConfig) {
    this.config = config;
    console.log('NotificationAPI initialized with client:', config.clientId);
  }

  async sendNotification(payload: NotificationPayload): Promise<{ success: boolean; id?: string }> {
    if (!this.config?.apiKey) {
      console.warn('NotificationAPI not configured with API key');
      return { success: false };
    }

    try {
      const notificationData = {
        notificationId: payload.templateId || 'default_template',
        user: {
          id: payload.userId,
          email: payload.userId // Assuming userId is email for simplicity
        },
        merge: {
          title: payload.title,
          message: payload.body,
          actionUrl: payload.actionUrl,
          ...payload.templateParams
        }
      };

      // Send immediate notification
      if (!payload.scheduledFor || payload.scheduledFor <= new Date()) {
        const response = await fetch(`${this.baseUrl}/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(this.config.clientId + ':' + this.config.apiKey)}`
          },
          body: JSON.stringify(notificationData)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`NotificationAPI error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('Notification sent successfully:', result);
        return { success: true, id: result.id };
      } else {
        // Schedule notification for future delivery
        const scheduleResponse = await fetch(`${this.baseUrl}/schedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(this.config.clientId + ':' + this.config.apiKey)}`
          },
          body: JSON.stringify({
            ...notificationData,
            scheduledDate: payload.scheduledFor.toISOString()
          })
        });

        if (!scheduleResponse.ok) {
          const errorText = await scheduleResponse.text();
          throw new Error(`NotificationAPI scheduling error: ${scheduleResponse.status} - ${errorText}`);
        }

        const result = await scheduleResponse.json();
        console.log('Notification scheduled successfully:', result);
        return { success: true, id: result.id };
      }
    } catch (error) {
      console.error('Failed to send/schedule notification:', error);
      return { success: false };
    }
  }

  async scheduleAppointmentReminders(
    appointmentId: string, 
    appointmentDate: Date, 
    patientEmail: string, 
    patientPhone?: string,
    doctorName: string = 'Dr. Fintan Ekochin'
  ): Promise<ScheduledNotification[]> {
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

    try {
      // Schedule 24-hour reminder
      const result24h = await this.sendNotification({
        notificationId: reminder24h.id,
        userId: patientEmail,
        title: `Appointment Reminder - Tomorrow`,
        body: `You have a consultation with ${doctorName} scheduled for tomorrow at ${appointmentDate.toLocaleTimeString()}.`,
        actionUrl: `/booking/confirmation?id=${appointmentId}`,
        scheduledFor: reminder24h.scheduledFor,
        channels,
        templateId: 'appointment_reminder_24h',
        templateParams: {
          doctorName,
          appointmentDate: appointmentDate.toLocaleDateString(),
          appointmentTime: appointmentDate.toLocaleTimeString()
        }
      });

      if (result24h.success) {
        reminder24h.status = 'pending';
        reminder24h.notificationApiId = result24h.id;
      } else {
        reminder24h.status = 'failed';
      }

      // Schedule 1-hour reminder
      const result1h = await this.sendNotification({
        notificationId: reminder1h.id,
        userId: patientEmail,
        title: `Appointment Starting Soon`,
        body: `Your consultation with ${doctorName} starts in 1 hour. Please prepare for your video call.`,
        actionUrl: `/consultation/join?id=${appointmentId}`,
        scheduledFor: reminder1h.scheduledFor,
        channels,
        templateId: 'appointment_reminder_1h',
        templateParams: {
          doctorName,
          joinLink: `/consultation/join?id=${appointmentId}`
        }
      });

      if (result1h.success) {
        reminder1h.status = 'pending';
        reminder1h.notificationApiId = result1h.id;
      } else {
        reminder1h.status = 'failed';
      }

      notifications.push(reminder24h, reminder1h);
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
      channels: ['email', 'in_app'],
      templateId: 'appointment_confirmation',
      templateParams: {
        ...appointmentDetails,
        appointmentId,
        confirmationUrl: `/booking/confirmation?id=${appointmentId}`
      }
    });

    return result.success;
  }

  async sendConsultationStartNotification(
    appointmentId: string,
    patientEmail: string,
    sessionId: string
  ): Promise<boolean> {
    const result = await this.sendNotification({
      notificationId: `consultation_start_${appointmentId}`,
      userId: patientEmail,
      title: 'Your Consultation is Ready',
      body: 'Dr. Fintan Ekochin is ready to begin your consultation. Click to join the video call.',
      actionUrl: `/consultation/join?session=${sessionId}`,
      channels: ['email', 'push', 'in_app'],
      templateId: 'consultation_start',
      templateParams: {
        sessionId,
        joinLink: `/consultation/join?session=${sessionId}`
      }
    });

    return result.success;
  }

  async cancelScheduledNotification(notificationApiId: string): Promise<boolean> {
    if (!this.config?.apiKey) {
      console.warn('NotificationAPI not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/scheduled/${notificationApiId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${btoa(this.config.clientId + ':' + this.config.apiKey)}`
        }
      });

      if (response.ok) {
        console.log('Scheduled notification cancelled:', notificationApiId);
        return true;
      } else {
        console.error('Failed to cancel notification:', response.status, await response.text());
        return false;
      }
    } catch (error) {
      console.error('Failed to cancel notification:', error);
      return false;
    }
  }

  async getScheduledNotifications(): Promise<ApiScheduledNotification[]> {
    if (!this.config?.apiKey) {
      console.warn('NotificationAPI not configured');
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/scheduled`, {
        headers: {
          'Authorization': `Basic ${btoa(this.config.clientId + ':' + this.config.apiKey)}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.notifications || [];
      }
    } catch (error) {
      console.error('Failed to fetch scheduled notifications:', error);
    }

    return [];
  }
}

export const notificationService = new NotificationService();
