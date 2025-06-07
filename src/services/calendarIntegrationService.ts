
import { format, parseISO } from 'date-fns';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  location?: string;
  attendees?: string[];
}

export interface CalendarProvider {
  name: string;
  url: string;
  icon: string;
}

class CalendarIntegrationService {
  private providers: CalendarProvider[] = [
    { name: 'Google Calendar', url: 'google', icon: '📅' },
    { name: 'Apple Calendar', url: 'apple', icon: '🍎' },
    { name: 'Outlook', url: 'outlook', icon: '📧' },
    { name: 'Yahoo Calendar', url: 'yahoo', icon: '📩' }
  ];

  createGoogleCalendarUrl(event: CalendarEvent): string {
    const startTime = format(event.start, "yyyyMMdd'T'HHmmss");
    const endTime = format(event.end, "yyyyMMdd'T'HHmmss");
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startTime}/${endTime}`,
      details: event.description,
      location: event.location || '',
      trp: 'false'
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  createOutlookUrl(event: CalendarEvent): string {
    const startTime = event.start.toISOString();
    const endTime = event.end.toISOString();
    
    const params = new URLSearchParams({
      subject: event.title,
      startdt: startTime,
      enddt: endTime,
      body: event.description,
      location: event.location || ''
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }

  createICSFile(event: CalendarEvent): string {
    const startTime = format(event.start, "yyyyMMdd'T'HHmmss'Z'");
    const endTime = format(event.end, "yyyyMMdd'T'HHmmss'Z'");
    const now = format(new Date(), "yyyyMMdd'T'HHmmss'Z'");

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Ekochin Health//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      `DTSTAMP:${now}`,
      `UID:${event.id}@ekocinhealth.com`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description}`,
      `LOCATION:${event.location || ''}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  }

  downloadICSFile(event: CalendarEvent): void {
    const icsContent = this.createICSFile(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  addToCalendar(provider: string, event: CalendarEvent): void {
    switch (provider) {
      case 'google':
        window.open(this.createGoogleCalendarUrl(event), '_blank');
        break;
      case 'outlook':
        window.open(this.createOutlookUrl(event), '_blank');
        break;
      case 'apple':
      case 'yahoo':
        this.downloadICSFile(event);
        break;
      default:
        this.downloadICSFile(event);
    }
  }

  getProviders(): CalendarProvider[] {
    return this.providers;
  }
}

export const calendarIntegrationService = new CalendarIntegrationService();
