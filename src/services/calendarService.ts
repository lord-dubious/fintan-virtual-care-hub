import { AppointmentWithDetails } from '../../shared/domain'; // Import the specific type
import { logger } from '../lib/utils/monitoring';

// Calendar Integration Service
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
  meetingLink?: string;
  [key: string]: unknown; // Add index signature
}

export interface CalendarProvider {
  type: 'google' | 'outlook' | 'apple' | 'ics';
  accessToken?: string;
  refreshToken?: string;
}

class CalendarService {
  async createCalendarEvent(event: CalendarEvent, provider: CalendarProvider): Promise<string | null> {
    switch (provider.type) {
      case 'google':
        return await this.createGoogleCalendarEvent(event, provider.accessToken);
      case 'outlook':
        return await this.createOutlookEvent(event, provider.accessToken);
      case 'ics':
        return this.generateICSFile(event);
      default:
        logger.warn('Unsupported calendar provider', { type: provider.type });
        return null;
    }
  }

  private async createGoogleCalendarEvent(event: CalendarEvent, accessToken?: string): Promise<string | null> {
    if (!accessToken) {
      // For now, return a placeholder URL that would redirect to Google Calendar
      const googleCalendarUrl = this.generateGoogleCalendarUrl(event);
      window.open(googleCalendarUrl, '_blank');
      return googleCalendarUrl;
    }

    try {
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          attendees: event.attendees.map(email => ({ email })),
          location: event.location
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.id;
      }
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to create Google Calendar event:', errorData);
    }

    return null;
  }

  private async createOutlookEvent(event: CalendarEvent, accessToken?: string): Promise<string | null> {
    if (!accessToken) {
      // Generate Outlook web calendar URL
      const outlookUrl = this.generateOutlookUrl(event);
      window.open(outlookUrl, '_blank');
      return outlookUrl;
    }

    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: event.title,
          body: {
            contentType: 'HTML',
            content: event.description
          },
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          attendees: event.attendees.map(email => ({
            emailAddress: { address: email, name: email }
          })),
          location: event.location ? { displayName: event.location } : undefined
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.id;
      }
    } catch (error: unknown) {
      const errorData = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
      logger.error('Failed to create Outlook event:', errorData);
    }

    return null;
  }

  private generateGoogleCalendarUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${this.formatDateForUrl(event.startTime)}/${this.formatDateForUrl(event.endTime)}`,
      details: event.description,
      location: event.location || '',
      add: event.attendees.join(',')
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  private generateOutlookUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
      subject: event.title,
      startdt: event.startTime.toISOString(),
      enddt: event.endTime.toISOString(),
      body: event.description,
      location: event.location || '',
      to: event.attendees.join(';')
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  private generateICSFile(event: CalendarEvent): string {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Dr. Fintan Ekochin//Consultation//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@drfintan.com`,
      `DTSTART:${this.formatDateForICS(event.startTime)}`,
      `DTEND:${this.formatDateForICS(event.endTime)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location || 'Online Video Consultation'}`,
      ...event.attendees.map(email => `ATTENDEE:MAILTO:${email}`),
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `consultation-${event.id}.ics`;
    link.click();
    
    window.URL.revokeObjectURL(url);
    return url;
  }

  private formatDateForUrl(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  private formatDateForICS(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  async syncWithCalendar(appointmentId: string, appointmentData: AppointmentWithDetails): Promise<boolean> {
    const event: CalendarEvent = {
      id: appointmentId,
      title: `Consultation with Dr. Fintan Ekochin`,
      description: `Medical consultation session.\n\nReason: ${appointmentData.reason || 'N/A'}\n\nJoin link will be provided before the appointment.`,
      startTime: appointmentData.appointmentDate,
      endTime: new Date(appointmentData.appointmentDate.getTime() + 30 * 60 * 1000), // 30 minutes
      attendees: [appointmentData.patient?.user.email || '', 'dr.fintan@example.com'], // Use patient's email
      location: 'Online Video Consultation'
    };

    // For now, provide multiple calendar options
    logger.info('Calendar event ready', event); // Pass event directly as data
    return true;
  }
}

export const calendarService = new CalendarService();
