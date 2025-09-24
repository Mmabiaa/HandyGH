import { prisma } from '../models/prismaClient';

interface CommissionConfig {
  percentage: number;
  minimumFee: number;
  maximumFee?: number;
  currency: string;
}

interface PayoutConfig {
  holdPeriodDays: number;
  minimumPayoutAmount: number;
  currency: string;
}

class CommissionService {
  private defaultCommissionConfig: CommissionConfig = {
    percentage: 10, // 10% commission
    minimumFee: 5, // Minimum 5 GHS
    maximumFee: 100, // Maximum 100 GHS
    currency: 'GHS'
  };

  private defaultPayoutConfig: PayoutConfig = {
    holdPeriodDays: 7, // Hold payments for 7 days
    minimumPayoutAmount: 50, // Minimum 50 GHS for payout
    currency: 'GHS'
  };

  /**
   * Calculate platform commission for a booking amount
   * FR-13: Platform commission deduction
   */
  async calculateCommission(amount: number, config?: Partial<CommissionConfig>): Promise<{
    grossAmount: number;
    commissionAmount: number;
    netAmount: number;
    commissionRate: number;
  }> {
    const commissionConfig = { ...this.defaultCommissionConfig, ...config };
    
    // Calculate percentage-based commission
    const percentageCommission = (amount * commissionConfig.percentage) / 100;
    
    // Apply minimum fee
    let commissionAmount = Math.max(percentageCommission, commissionConfig.minimumFee);
    
    // Apply maximum fee if specified
    if (commissionConfig.maximumFee) {
      commissionAmount = Math.min(commissionAmount, commissionConfig.maximumFee);
    }
    
    const netAmount = amount - commissionAmount;
    
    return {
      grossAmount: amount,
      commissionAmount,
      netAmount,
      commissionRate: commissionConfig.percentage
    };
  }

  /**
   * Record commission for a successful booking
   * FR-12: Record payment transactions and support reconciliations
   */
  async recordCommission(bookingId: string, amount: number, commissionAmount: number): Promise<void> {
    await prisma.transaction.create({
      data: {
        booking_id: bookingId,
        txn_provider: 'PLATFORM_COMMISSION',
        amount: commissionAmount,
        currency: 'GHS',
        status: 'SUCCESS',
        metadata: {
          type: 'COMMISSION',
          grossAmount: amount,
          commissionRate: (commissionAmount / amount) * 100
        }
      }
    });
  }

  /**
   * Calculate provider payout amount
   * FR-12: Hold provider payouts until settlement
   */
  async calculateProviderPayout(bookingId: string): Promise<{
    bookingId: string;
    grossAmount: number;
    commissionAmount: number;
    payoutAmount: number;
    holdUntil: Date;
    canPayout: boolean;
  }> {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        transactions: {
          where: { status: 'SUCCESS' }
        }
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const commissionTransaction = booking.transactions.find(t => t.txn_provider === 'PLATFORM_COMMISSION');
    const commissionAmount = commissionTransaction?.amount || 0;
    const payoutAmount = booking.total_amount - commissionAmount;
    
    const holdUntil = new Date();
    holdUntil.setDate(holdUntil.getDate() + this.defaultPayoutConfig.holdPeriodDays);
    
    const canPayout = new Date() >= holdUntil && payoutAmount >= this.defaultPayoutConfig.minimumPayoutAmount;

    return {
      bookingId,
      grossAmount: Number(booking.total_amount),
      commissionAmount: Number(commissionAmount),
      payoutAmount,
      holdUntil,
      canPayout
    };
  }

  /**
   * Process provider payout
   */
  async processProviderPayout(bookingId: string, providerId: string): Promise<{
    success: boolean;
    payoutAmount: number;
    transactionId: string;
  }> {
    const payoutInfo = await this.calculateProviderPayout(bookingId);
    
    if (!payoutInfo.canPayout) {
      throw new Error('Payout not yet available or below minimum amount');
    }

    // Create payout transaction
    const payoutTransaction = await prisma.transaction.create({
      data: {
        booking_id: bookingId,
        txn_provider: 'PROVIDER_PAYOUT',
        payee_id: providerId,
        amount: payoutInfo.payoutAmount,
        currency: 'GHS',
        status: 'SUCCESS',
        metadata: {
          type: 'PROVIDER_PAYOUT',
          originalBookingId: bookingId
        }
      }
    });

    return {
      success: true,
      payoutAmount: payoutInfo.payoutAmount,
      transactionId: payoutTransaction.id
    };
  }

  /**
   * Get commission summary for admin dashboard
   */
  async getCommissionSummary(startDate: Date, endDate: Date): Promise<{
    totalCommissions: number;
    totalPayouts: number;
    netRevenue: number;
    transactionCount: number;
  }> {
    const commissionTransactions = await prisma.transaction.findMany({
      where: {
        txn_provider: 'PLATFORM_COMMISSION',
        status: 'SUCCESS',
        created_at: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const payoutTransactions = await prisma.transaction.findMany({
      where: {
        txn_provider: 'PROVIDER_PAYOUT',
        status: 'SUCCESS',
        created_at: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    const totalCommissions = commissionTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalPayouts = payoutTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const netRevenue = totalCommissions - totalPayouts;

    return {
      totalCommissions,
      totalPayouts,
      netRevenue,
      transactionCount: commissionTransactions.length
    };
  }

  /**
   * Update commission configuration
   */
  async updateCommissionConfig(config: Partial<CommissionConfig>): Promise<void> {
    // In a real implementation, this would be stored in a configuration table
    // For now, we'll update the default config
    this.defaultCommissionConfig = { ...this.defaultCommissionConfig, ...config };
  }

  /**
   * Get pending payouts for providers
   */
  async getPendingPayouts(providerId?: string): Promise<Array<{
    bookingId: string;
    providerId: string;
    amount: number;
    holdUntil: Date;
    canPayout: boolean;
  }>> {
    const bookings = await prisma.booking.findMany({
      where: {
        status: 'COMPLETED',
        payment_status: 'PAID',
        ...(providerId && { provider_id: providerId })
      },
      include: {
        provider: true,
        transactions: {
          where: { status: 'SUCCESS' }
        }
      }
    });

    const pendingPayouts = [];
    
    for (const booking of bookings) {
      const payoutInfo = await this.calculateProviderPayout(booking.id);
      pendingPayouts.push({
        bookingId: booking.id,
        providerId: booking.provider_id,
        amount: payoutInfo.payoutAmount,
        holdUntil: payoutInfo.holdUntil,
        canPayout: payoutInfo.canPayout
      });
    }

    return pendingPayouts;
  }
}

export const commissionService = new CommissionService();
