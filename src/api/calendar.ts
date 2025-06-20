import { apiClient, ApiResponse } from './client';

// Calendar types
export interface AvailabilityRequest {
  providerId: string;
  dateFrom: Date;
  dateTo: Date;
  consultationType?: 'VIDEO' | 'AUDIO';
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBlocked?: boolean;
  blockReason?: string;
  appointmentId?: string;
}

export interface DayAvailability {
  date: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
  workingHours: {
    start: string;
    end: string;
  };
}

export interface CalendarEvent {
  id: string;
  providerId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'appointment' | 'blocked' | 'break' | 'personal';
  appointmentId?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  color?: string;
}

export interface ProviderSchedule {
  providerId: string;
  workingHours: {
    [key: string]: {
      isWorking: boolean;
      start: string;
      end: string;
      breaks?: Array<{
        start: string;
        end: string;
        title: string;
      }>;
    };
  };
  timeZone: string;
  slotDuration: number; // in minutes
  bufferTime: number; // in minutes
}

export interface BlockTimeSlotRequest {
  providerId: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason?: string;
}

export interface CalendarExport {
  filename: string;
  icsContent: string;
}

// Calendar API
export const calendarApi = {
  // Get availability for a provider within a date range
  async getAvailability(request: AvailabilityRequest): Promise<ApiResponse<DayAvailability[]>> {
    return apiClient.get<DayAvailability[]>('/calendar/availability', {
      providerId: request.providerId,
      dateFrom: request.dateFrom.toISOString(),
      dateTo: request.dateTo.toISOString(),
      consultationType: request.consultationType
    });
  },

  // Get availability for a specific day
  async getDayAvailability(providerId: string, date: Date): Promise<ApiResponse<DayAvailability>> {
    return apiClient.get<DayAvailability>(`/calendar/availability/${providerId}`, {
      date: date.toISOString().split('T')[0]
    });
  },

  // Get provider's schedule configuration
  async getProviderSchedule(providerId: string): Promise<ApiResponse<ProviderSchedule>> {
    return apiClient.get<ProviderSchedule>(`/calendar/schedule/${providerId}`);
  },

  // Update provider's schedule
  async updateProviderSchedule(providerId: string, schedule: Partial<ProviderSchedule>): Promise<ApiResponse<ProviderSchedule>> {
    return apiClient.put<ProviderSchedule>(`/calendar/schedule/${providerId}`, schedule);
  },

  // Get calendar events for a provider within a date range
  async getCalendarEvents(providerId: string, dateFrom: Date, dateTo: Date): Promise<ApiResponse<CalendarEvent[]>> {
    return apiClient.get<CalendarEvent[]>(`/calendar/events/${providerId}`, {
      dateFrom: dateFrom.toISOString(),
      dateTo: dateTo.toISOString()
    });
  },

  // Create a calendar event
  async createCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<ApiResponse<CalendarEvent>> {
    return apiClient.post<CalendarEvent>('/calendar/events', event);
  },

  // Update a calendar event
  async updateCalendarEvent(eventId: string, event: Partial<CalendarEvent>): Promise<ApiResponse<CalendarEvent>> {
    return apiClient.put<CalendarEvent>(`/calendar/events/${eventId}`, event);
  },

  // Delete a calendar event
  async deleteCalendarEvent(eventId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/calendar/events/${eventId}`);
  },

  // Block a time slot
  async blockTimeSlot(request: BlockTimeSlotRequest): Promise<ApiResponse<CalendarEvent>> {
    return apiClient.post<CalendarEvent>('/calendar/block-time', {
      ...request,
      date: request.date.toISOString().split('T')[0]
    });
  },

  // Unblock a time slot
  async unblockTimeSlot(providerId: string, date: Date, startTime: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/calendar/block-time?providerId=${providerId}&date=${date.toISOString().split('T')[0]}&startTime=${startTime}`);
  },

  // Generate calendar export (ICS file) for an appointment
  async generateCalendarExport(appointmentId: string): Promise<ApiResponse<CalendarExport>> {
    return apiClient.get<CalendarExport>(`/calendar/export/${appointmentId}`);
  },

  // Sync with external calendar (Google, Outlook, etc.)
  async syncExternalCalendar(providerId: string, calendarType: 'google' | 'outlook' | 'apple'): Promise<ApiResponse<{
    syncStatus: 'success' | 'failed';
    eventsImported: number;
    lastSyncAt: string;
  }>> {
    return apiClient.post(`/calendar/sync/${providerId}`, { calendarType });
  },

  // Get external calendar integration status
  async getCalendarIntegrationStatus(providerId: string): Promise<ApiResponse<{
    google?: { connected: boolean; lastSync?: string };
    outlook?: { connected: boolean; lastSync?: string };
    apple?: { connected: boolean; lastSync?: string };
  }>> {
    return apiClient.get(`/calendar/integrations/${providerId}`);
  },

  // Connect external calendar
  async connectExternalCalendar(providerId: string, calendarType: 'google' | 'outlook' | 'apple', authCode: string): Promise<ApiResponse<{
    connected: boolean;
    calendarName: string;
  }>> {
    return apiClient.post(`/calendar/connect/${providerId}`, {
      calendarType,
      authCode
    });
  },

  // Disconnect external calendar
  async disconnectExternalCalendar(providerId: string, calendarType: 'google' | 'outlook' | 'apple'): Promise<ApiResponse<void>> {
    return apiClient.delete(`/calendar/connect/${providerId}/${calendarType}`);
  },
};

export default calendarApi;
