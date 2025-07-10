import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';

interface ActivityItem {
  id: string;
  type: 'appointment' | 'prescription' | 'message' | 'payment' | 'record' | 'consultation';
  title: string;
  description: string;
  timestamp: Date;
  status?: 'success' | 'warning' | 'info' | 'error';
  actionable?: boolean;
  metadata?: Record<string, unknown>;
}

// Health metrics removed - focusing on core features

interface PatientActivityData {
  activities: ActivityItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  [key: string]: unknown;
}

export const usePatientActivity = (): PatientActivityData => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const generateMockActivities = (): ActivityItem[] => {
    const now = new Date();
    return [
      {
        id: '1',
        type: 'appointment',
        title: 'Appointment Confirmed',
        description: 'Your video consultation with Dr. Fintan has been confirmed for tomorrow at 2:00 PM',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'success',
        actionable: true,
        metadata: { appointmentId: 'apt_123' }
      },
      {
        id: '2',
        type: 'prescription',
        title: 'New Prescription Available',
        description: 'Dr. Fintan has prescribed Lisinopril 10mg. Please review and confirm.',
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
        status: 'info',
        actionable: true,
        metadata: { prescriptionId: 'rx_456' }
      },
      {
        id: '3',
        type: 'payment',
        title: 'Payment Processed',
        description: 'Payment of $150 for consultation has been successfully processed',
        timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
        status: 'success',
        actionable: false,
        metadata: { paymentId: 'pay_789', amount: 150 }
      },
      {
        id: '4',
        type: 'record',
        title: 'Lab Results Available',
        description: 'Your blood work results from last week are now available for review',
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'info',
        actionable: true,
        metadata: { recordId: 'lab_101' }
      },
      {
        id: '5',
        type: 'message',
        title: 'Message from Dr. Fintan',
        description: 'Please remember to take your medication with food as discussed',
        timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'info',
        actionable: true,
        metadata: { messageId: 'msg_202' }
      }
    ];
  };

  // Health metrics removed - focusing on core features

  const fetchActivityData = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Try to fetch from real backend APIs first
      try {
        const activitiesRes = await api.get('/patients/activities');

        if (activitiesRes.data.success) {
          setActivities(activitiesRes.data.data || []);
          return;
        }
      } catch (apiError) {
        console.warn('Backend APIs not available, using mock data:', apiError);
      }

      // Fallback to mock data if backend APIs are not available
      console.log('Using mock data for dashboard');
      const mockActivities = generateMockActivities();

      setActivities(mockActivities);
    } catch (err) {
      console.error('Failed to fetch activity data:', err);
      setError('Failed to load activity data');

      // Final fallback to mock data on error
      setActivities(generateMockActivities());
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const refetch = async () => {
    await fetchActivityData();
  };

  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]);

  return {
    activities,
    isLoading,
    error,
    refetch
  };
};

// Hook for fetching real activity data from notifications
export const usePatientNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await api.get('/notifications');
      
      if (response.data.success) {
        // Transform notifications into activity items
        const activities = response.data?.data.map((notification: NotificationData) => ({
          id: notification.id,
          type: notification.type.toLowerCase(),
          title: notification.title,
          description: notification.message,
          timestamp: new Date(notification.createdAt),
          status: notification.isRead ? 'info' : 'warning',
          actionable: !notification.isRead,
          metadata: notification.metadata
        }));
        
        setNotifications(activities);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    isLoading,
    error,
    refetch: fetchNotifications
  };
};
