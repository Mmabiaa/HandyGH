import { api } from '../client';

/**
 * Payout Service
 * Handles provider payout account and payout requests
 *
 * Requirements: 10.9, 10.10
 */

export interface BankingInfo {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  branchCode?: string;
  accountType: 'savings' | 'current';
  isVerified: boolean;
  isPrimary: boolean;
}

export interface PayoutSchedule {
  frequency: 'weekly' | 'biweekly' | 'monthly';
  nextPayoutDate: string;
  minimumAmount: number;
}

export interface Payout {
  id: string;
  amount: number;
  currency: 'GHS';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  processedAt?: string;
  bankingInfoId: string;
  transactionReference?: string;
  failureReason?: string;
}

export interface PaginatedPayouts {
  results: Payout[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface PayoutRequest {
  amount: number;
  bankingInfoId: string;
}

export class PayoutService {
  private static readonly BASE_PATH = '/api/v1/provider/payouts';

  /**
   * Get banking information
   * Requirement 10.9: Display payout account information
   */
  static async getBankingInfo(): Promise<BankingInfo[]> {
    return api.get<BankingInfo[]>(`${this.BASE_PATH}/banking-info/`);
  }

  /**
   * Add banking information
   * Requirement 10.9: Manage payout account
   */
  static async addBankingInfo(data: Omit<BankingInfo, 'id' | 'isVerified'>): Promise<BankingInfo> {
    return api.post<BankingInfo>(`${this.BASE_PATH}/banking-info/`, data);
  }

  /**
   * Update banking information
   * Requirement 10.9: Update payout account
   */
  static async updateBankingInfo(
    id: string,
    data: Partial<BankingInfo>
  ): Promise<BankingInfo> {
    return api.patch<BankingInfo>(`${this.BASE_PATH}/banking-info/${id}/`, data);
  }

  /**
   * Delete banking information
   * Requirement 10.9: Remove payout account
   */
  static async deleteBankingInfo(id: string): Promise<void> {
    return api.delete(`${this.BASE_PATH}/banking-info/${id}/`);
  }

  /**
   * Get payout schedule
   * Requirement 10.9: Show payout schedule
   */
  static async getPayoutSchedule(): Promise<PayoutSchedule> {
    return api.get<PayoutSchedule>(`${this.BASE_PATH}/schedule/`);
  }

  /**
   * Get payout history
   * Requirement 10.9: Show payout history
   */
  static async getPayouts(page: number = 1, pageSize: number = 20): Promise<PaginatedPayouts> {
    return api.get<PaginatedPayouts>(`${this.BASE_PATH}/`, {
      params: {
        page,
        page_size: pageSize,
      },
    });
  }

  /**
   * Request payout
   * Requirement 10.10: Implement payout request functionality
   */
  static async requestPayout(data: PayoutRequest): Promise<Payout> {
    return api.post<Payout>(`${this.BASE_PATH}/request/`, data);
  }

  /**
   * Get available balance for payout
   * Requirement 10.10: Check available balance
   */
  static async getAvailableBalance(): Promise<{ availableBalance: number; currency: 'GHS' }> {
    return api.get(`${this.BASE_PATH}/available-balance/`);
  }
}
