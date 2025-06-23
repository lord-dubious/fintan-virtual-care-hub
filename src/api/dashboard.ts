import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

// Dashboard types
export interface DashboardStats {
  totalPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  averageRating: number;
  newPatientsThisMonth: number;
  appointmentsThisMonth: number;
  revenueThisMonth: number;
  growthRate: {
    patients: number;
    appointments: number;
    revenue: number;
  };
}

export interface AppointmentSummary {
  id: string;
  patientName: string;
  patientAvatar?: string;
  scheduledAt: string;
  consultationType: 'VIDEO' | 'AUDIO';
  status: string;
  duration: number;
  reason?: string;
}

export interface ActivityItem {
  id: string;
  type: 'appointment_created' | 'appointment_completed' | 'appointment_cancelled' | 'patient_registered' | 'payment_received';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface ChartDataPoint {
  date: string;
  appointments: number;
  revenue: number;
  patients: number;
}

export interface ChartData {
  period: 'week' | 'month' | 'quarter' | 'year';
  data: ChartDataPoint[];
  summary: {
    totalAppointments: number;
    totalRevenue: number;
    totalPatients: number;
    averagePerDay: {
      appointments: number;
      revenue: number;
      patients: number;
    };
  };
}

export interface DashboardData {
  stats: DashboardStats;
  upcomingAppointments: AppointmentSummary[];
  recentActivity: ActivityItem[];
  chartData: ChartData;
}

// Dashboard API
export const dashboardApi = {
  // Get complete dashboard data
  async getDashboardData(dateRange?: { from: Date; to: Date }): Promise<ApiResponse<DashboardData>> {
    const params = dateRange ? {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    } : undefined;
    
    return apiClient.get<DashboardData>(`${API_ENDPOINTS.ADMIN.STATISTICS}/dashboard`, params);
  },

  // Get dashboard statistics
  async getDashboardStats(dateRange?: { from: Date; to: Date }): Promise<ApiResponse<DashboardStats>> {
    const params = dateRange ? {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    } : undefined;
    
    return apiClient.get<DashboardStats>(`${API_ENDPOINTS.ADMIN.STATISTICS}/stats`, params);
  },

  // Get upcoming appointments
  async getUpcomingAppointments(limit: number = 5): Promise<ApiResponse<AppointmentSummary[]>> {
    return apiClient.get<AppointmentSummary[]>(`${API_ENDPOINTS.APPOINTMENTS.BY_PATIENT}`, { limit, status: 'scheduled' });
  },

  // Get recent activity
  async getRecentActivity(limit: number = 10): Promise<ApiResponse<ActivityItem[]>> {
    return apiClient.get<ActivityItem[]>(`${API_ENDPOINTS.ADMIN.STATISTICS}/activity/recent`, { limit });
  },

  // Get chart data
  async getChartData(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ApiResponse<ChartData>> {
    return apiClient.get<ChartData>(`${API_ENDPOINTS.ADMIN.STATISTICS}/charts`, { period });
  },

  // Get revenue analytics
  async getRevenueAnalytics(dateRange?: { from: Date; to: Date }): Promise<ApiResponse<{
    totalRevenue: number;
    revenueByMonth: Array<{ month: string; revenue: number }>;
    revenueByService: Array<{ service: string; revenue: number; count: number }>;
    averageRevenuePerAppointment: number;
  }>> {
    const params = dateRange ? {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    } : undefined;
    
    return apiClient.get(`${API_ENDPOINTS.ADMIN.STATISTICS}/analytics/revenue`, params);
  },

  // Get appointment analytics
  async getAppointmentAnalytics(dateRange?: { from: Date; to: Date }): Promise<ApiResponse<{
    totalAppointments: number;
    appointmentsByStatus: Array<{ status: string; count: number }>;
    appointmentsByType: Array<{ type: string; count: number }>;
    appointmentsByHour: Array<{ hour: number; count: number }>;
    averageDuration: number;
    completionRate: number;
  }>> {
    const params = dateRange ? {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    } : undefined;
    
    return apiClient.get(`${API_ENDPOINTS.ADMIN.STATISTICS}/analytics/appointments`, params);
  },

  // Get patient analytics
  async getPatientAnalytics(dateRange?: { from: Date; to: Date }): Promise<ApiResponse<{
    totalPatients: number;
    newPatients: number;
    activePatients: number;
    patientsByAge: Array<{ ageGroup: string; count: number }>;
    patientRetentionRate: number;
    averageAppointmentsPerPatient: number;
  }>> {
    const params = dateRange ? {
      from: dateRange.from.toISOString(),
      to: dateRange.to.toISOString()
    } : undefined;
    
    return apiClient.get(`${API_ENDPOINTS.ADMIN.STATISTICS}/analytics/patients`, params);
  },

  // Get patient dashboard data
  async getPatientDashboard(): Promise<ApiResponse<{
    upcomingAppointments: AppointmentSummary[];
    pastAppointments: AppointmentSummary[];
    medicalRecords: any[];
    prescriptions: any[];
    healthMetrics: any;
  }>> {
    return apiClient.get(`${API_ENDPOINTS.PATIENTS.BASE}/dashboard`);
  },
};

export default dashboardApi;
