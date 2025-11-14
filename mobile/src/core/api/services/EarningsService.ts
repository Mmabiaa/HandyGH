import { api } from '../client';

/**
 * Earnings Service
 * Handles provider earnings and financial data
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
 */

export interface EarningsData {
  totalEarnings: number;
  pendingPayments: number;
  completedPayments: number;
  period: 'week' | 'month' | 'year';
  breakdown: EarningsBreakdown[];
  trend: EarningsTrend[];
}

export interface EarningsBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface EarningsTrend {
  date: string;
  amount: number;
}

export interface Transaction {
  id: string;
  bookingId: string;
  amount: number;
  currency: 'GHS';
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  customerName: string;
  serviceName: string;
  date: string;
  createdAt: string;
}

export interface PaginatedTransactions {
  results: Transaction[];
  count: number;
  next: string | null;
  previous: string | null;
}

export class EarningsService {
  private static readonly BASE_PATH = '/api/v1/provider/earnings';

  /**
   * Get earnings data for specified period
   * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
   */
  static async getEarnings(period: 'week' | 'month' | 'year' = 'month'): Promise<EarningsData> {
    return api.get<EarningsData>(`${this.BASE_PATH}/`, {
      params: { period },
    });
  }

  /**
   * Get transaction history with pagination
   * Requirement 10.6: Display transaction list
   */
  static async getTransactions(
    page: number = 1,
    pageSize: number = 20,
    search?: string,
    status?: string
  ): Promise<PaginatedTransactions> {
    return api.get<PaginatedTransactions>(`${this.BASE_PATH}/transactions/`, {
      params: {
        page,
        page_size: pageSize,
        search,
        status,
      },
    });
  }

  /**
   * Get transaction details by ID
   * Requirement 10.6: View transaction details
   */
  static async getTransactionById(id: string): Promise<Transaction> {
    return api.get<Transaction>(`${this.BASE_PATH}/transactions/${id}/`);
  }
}
