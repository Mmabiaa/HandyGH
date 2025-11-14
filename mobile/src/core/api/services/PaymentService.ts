import { api } from '../client';
import {
  MoMoPaymentRequest,
  PaymentResponse,
  PaymentStatusResponse,
  PaymentMethod,
} from '../types';

/**
 * Payment Service
 * Handles Mobile Money (MoMo) payment integration and payment methods
 */
export class PaymentService {
  private static readonly BASE_PATH = '/api/v1/payments';

  /**
   * Initiate Mobile Money payment
   * Requirement 4.11: Integrate with MoMo payment system
   */
  static async initiateMoMoPayment(data: MoMoPaymentRequest): Promise<PaymentResponse> {
    return api.post<PaymentResponse>(`${this.BASE_PATH}/momo/initiate/`, data);
  }

  /**
   * Verify payment status
   */
  static async verifyPayment(transactionId: string): Promise<PaymentStatusResponse> {
    return api.get<PaymentStatusResponse>(
      `${this.BASE_PATH}/verify/${transactionId}/`
    );
  }

  /**
   * Get available payment methods for user
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    return api.get<PaymentMethod[]>(`${this.BASE_PATH}/methods/`);
  }

  /**
   * Add new payment method
   */
  static async addPaymentMethod(method: Omit<PaymentMethod, 'id'>): Promise<PaymentMethod> {
    return api.post<PaymentMethod>(`${this.BASE_PATH}/methods/`, method);
  }

  /**
   * Delete payment method
   */
  static async deletePaymentMethod(methodId: string): Promise<void> {
    return api.delete(`${this.BASE_PATH}/methods/${methodId}/`);
  }

  /**
   * Set default payment method
   */
  static async setDefaultPaymentMethod(methodId: string): Promise<void> {
    return api.patch(`${this.BASE_PATH}/methods/${methodId}/`, {
      isDefault: true,
    });
  }

  /**
   * Poll payment status until completion or timeout
   * Used for async payment verification
   */
  static async pollPaymentStatus(
    transactionId: string,
    maxAttempts: number = 10,
    intervalMs: number = 3000
  ): Promise<PaymentStatusResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.verifyPayment(transactionId);

      if (status.status === 'completed' || status.status === 'failed') {
        return status;
      }

      // Wait before next attempt
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error('Payment verification timeout');
  }
}
