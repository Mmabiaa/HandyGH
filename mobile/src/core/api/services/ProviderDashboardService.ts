import { api } from '../client';

/**
 * Provider Dashboard Service
 * Handles provider dashboard metrics and analytics
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

export interface DashboardMetrics {
  totalEarnings: number;
  activeBookingsCount: number;
  pendingRequestsCount: number;
  averageRating: number;
  completedServicesCount: number;
  responseRate: number;
}

export interface EarningsTrend {
  date: string;
  amount: number;
}

export interface UpcomingBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhoto?: string;
  serviceId: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  totalAmount: number;
  location: {
    address: string;
    city: string;
  };
}

export interface DashboardData {
  metrics: DashboardMetrics;
  earningsTrend: EarningsTrend[];
  upcomingBookings: UpcomingBooking[];
}

export class ProviderDashboardService {
  private static readonly BASE_PATH = '/api/v1/provider/dashboard';

  /**
   * Get provider dashboard data
   * Requirement 8.1: Retrieve dashboard metrics
   */
  static async getDashboardData(): Promise<DashboardData> {
    return api.get<DashboardData>(`${this.BASE_PATH}/`);
  }

  /**
   * Get dashboard metrics only
   * Requirement 8.2, 8.3, 8.4: Retrieve key business metrics
   */
  static async getMetrics(): Promise<DashboardMetrics> {
    return api.get<DashboardMetrics>(`${this.BASE_PATH}/metrics/`);
  }

  /**
   * Get earnings trend for specified period
   * Requirement 8.3: Show earnings trend chart
   */
  static async getEarningsTrend(days: number = 30): Promise<EarningsTrend[]> {
    return api.get<EarningsTrend[]>(`${this.BASE_PATH}/earnings-trend/`, {
      params: { days },
    });
  }

  /**
   * Get upcoming bookings
   * Requirement 8.4: Display upcoming bookings
   */
  static async getUpcomingBookings(days: number = 7): Promise<UpcomingBooking[]> {
    return api.get<UpcomingBooking[]>(`${this.BASE_PATH}/upcoming-bookings/`, {
      params: { days },
    });
  }
}
