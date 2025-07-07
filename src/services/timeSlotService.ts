import { format, parseISO, addMinutes, isBefore, isAfter } from 'date-fns';

export interface TimeSlot {
  time: string;
  available: boolean;
  duration: number;
  conflictReason?: string;
}

export interface AvailabilityData {
  date: string;
  dayOfWeek: string;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

export interface SlotValidationResult {
  isValid: boolean;
  reason?: string;
  conflictingAppointment?: any;
}

export class TimeSlotService {
  private static instance: TimeSlotService;
  private availabilityCache: Map<string, AvailabilityData[]> = new Map();
  private lastFetchTime: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): TimeSlotService {
    if (!TimeSlotService.instance) {
      TimeSlotService.instance = new TimeSlotService();
    }
    return TimeSlotService.instance;
  }

  /**
   * Get availability data with caching
   */
  async getAvailability(
    providerId: string,
    dateFrom: string,
    dateTo: string,
    forceRefresh = false
  ): Promise<AvailabilityData[]> {
    const cacheKey = `${providerId}-${dateFrom}-${dateTo}`;
    const now = Date.now();
    const lastFetch = this.lastFetchTime.get(cacheKey) || 0;
    
    // Return cached data if it's fresh and not forcing refresh
    if (!forceRefresh && (now - lastFetch) < this.CACHE_DURATION) {
      const cached = this.availabilityCache.get(cacheKey);
      if (cached) {
        console.log('📋 Using cached availability data');
        return cached;
      }
    }

    console.log('🔄 Fetching fresh availability data');
    
    try {
      const response = await fetch(
        `/api/providers/${providerId}/availability?dateFrom=${dateFrom}&dateTo=${dateTo}&timezone=UTC&duration=30`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Cache the data
        this.availabilityCache.set(cacheKey, data.data);
        this.lastFetchTime.set(cacheKey, now);
        
        console.log('✅ Availability data fetched and cached');
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch availability');
      }
    } catch (error) {
      console.error('❌ Error fetching availability:', error);
      
      // Return cached data if available, even if stale
      const cached = this.availabilityCache.get(cacheKey);
      if (cached) {
        console.log('⚠️ Using stale cached data due to fetch error');
        return cached;
      }
      
      throw error;
    }
  }

  /**
   * Validate if a specific time slot is still available
   */
  async validateTimeSlot(
    providerId: string,
    date: string,
    time: string,
    duration = 30
  ): Promise<SlotValidationResult> {
    try {
      console.log(`🔍 Validating slot: ${date} ${time} for provider ${providerId}`);
      
      // Create the appointment datetime
      const appointmentDateTime = new Date(`${date}T${time}:00.000Z`);
      const endDateTime = addMinutes(appointmentDateTime, duration);
      
      // Check if the slot is in the past
      if (isBefore(appointmentDateTime, new Date())) {
        return {
          isValid: false,
          reason: 'Cannot book appointments in the past'
        };
      }
      
      // Get fresh availability data for validation
      const availabilityData = await this.getAvailability(
        providerId,
        date,
        date,
        true // Force refresh for validation
      );
      
      const dayData = availabilityData.find(day => day.date === date);
      
      if (!dayData || !dayData.isAvailable) {
        return {
          isValid: false,
          reason: 'Provider is not available on this date'
        };
      }
      
      const timeSlot = dayData.timeSlots.find(slot => slot.time === time);
      
      if (!timeSlot) {
        return {
          isValid: false,
          reason: 'Time slot not found'
        };
      }
      
      if (!timeSlot.available) {
        return {
          isValid: false,
          reason: timeSlot.conflictReason || 'Time slot is not available'
        };
      }
      
      // Additional real-time check with backend
      const realTimeCheck = await this.performRealTimeSlotCheck(
        providerId,
        appointmentDateTime,
        duration
      );
      
      if (!realTimeCheck.isValid) {
        // Invalidate cache since data is stale
        this.invalidateCache(providerId);
        return realTimeCheck;
      }
      
      console.log('✅ Time slot validation passed');
      return { isValid: true };
      
    } catch (error) {
      console.error('❌ Error validating time slot:', error);
      return {
        isValid: false,
        reason: 'Unable to validate time slot. Please try again.'
      };
    }
  }

  /**
   * Perform real-time slot availability check with backend
   */
  private async performRealTimeSlotCheck(
    providerId: string,
    startDateTime: Date,
    duration: number
  ): Promise<SlotValidationResult> {
    try {
      const response = await fetch('/api/appointments/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          startDateTime: startDateTime.toISOString(),
          duration
        })
      });
      
      if (!response.ok) {
        // If endpoint doesn't exist, assume slot is valid
        if (response.status === 404) {
          return { isValid: true };
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return {
          isValid: data.data.available,
          reason: data.data.available ? undefined : data.data.reason,
          conflictingAppointment: data.data.conflictingAppointment
        };
      } else {
        return {
          isValid: false,
          reason: data.error || 'Slot validation failed'
        };
      }
    } catch (error) {
      console.warn('⚠️ Real-time slot check failed, assuming available:', error);
      // If real-time check fails, assume slot is available
      // This prevents blocking bookings due to network issues
      return { isValid: true };
    }
  }

  /**
   * Get available time slots for a specific date
   */
  async getTimeSlotsForDate(
    providerId: string,
    date: string
  ): Promise<TimeSlot[]> {
    try {
      const availabilityData = await this.getAvailability(
        providerId,
        date,
        date
      );
      
      const dayData = availabilityData.find(day => day.date === date);
      return dayData?.timeSlots.filter(slot => slot.available) || [];
    } catch (error) {
      console.error('❌ Error getting time slots for date:', error);
      return [];
    }
  }

  /**
   * Refresh availability data for a provider
   */
  async refreshAvailability(providerId: string, dateFrom: string, dateTo: string): Promise<void> {
    await this.getAvailability(providerId, dateFrom, dateTo, true);
  }

  /**
   * Invalidate cache for a provider
   */
  invalidateCache(providerId: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.availabilityCache.keys()) {
      if (key.startsWith(providerId)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.availabilityCache.delete(key);
      this.lastFetchTime.delete(key);
    });
    
    console.log(`🗑️ Invalidated cache for provider ${providerId}`);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.availabilityCache.clear();
    this.lastFetchTime.clear();
    console.log('🗑️ All availability cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.availabilityCache.size,
      keys: Array.from(this.availabilityCache.keys())
    };
  }
}

// Export singleton instance
export const timeSlotService = TimeSlotService.getInstance();
