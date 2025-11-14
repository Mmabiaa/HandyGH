import { api } from '../client';

/**
 * Performance Service
 * Handles provider performance metrics and analytics
 *
 * Requirements: 10.7, 10.8
 */

export interface PerformanceMetrics {
  bookingAcceptanceRate: number;
  averageRating: number;
  averageResponseTime: number; // in minutes
  totalServices: number;
  repeatCustomerRate: number;
  comparisonPeriod: {
    bookingAcceptanceRate: number;
    averageRating: number;
    averageResponseTime: number;
  };
}

export interface PerformanceTrend {
  date: string;
  acceptanceRate: number;
  rating: number;
  responseTime: number;
}

export class PerformanceService {
  private static readonly BASE_PATH = '/api/v1/provider/performance';

  /**
   * Get performance metrics
   * Requirements: 10.7, 10.8
   */
  static async getMetrics(): Promise<PerformanceMetrics> {
    return api.get<PerformanceMetrics>(`${this.BASE_PATH}/metrics/`);
  }

  /**
   * Get performance trend data
   * Requirement 10.8: Show performance trend visualizations
   */
  static async getTrend(days: number = 30): Promise<PerformanceTrend[]> {
    return api.get<PerformanceTrend[]>(`${this.BASE_PATH}/trend/`, {
      params: { days },
    });
  }
}
