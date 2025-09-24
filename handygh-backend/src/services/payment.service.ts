import { prisma } from '../models/prismaClient';
import { commissionService } from './commission.service';
import { notificationService } from '../utils/notification';
import { auditHelpers } from '../utils/audit';

interface MomoPaymentData {
  bookingId: string;
  phoneNumber: string;
  amount: number;
  currency: string;
  customerId: string;
}

interface ManualPaymentData {
  bookingId: string;
  transactionReference: string;
  amount: number;
  phoneNumber: string;
  paymentMethod: string;
  customerId: string;
}

class PaymentService {
  /**
   * Initiate MTN MoMo payment - FR-11
   */
  async initiateMomoPayment(data: MomoPaymentData) {
    const { bookingId, phoneNumber, amount, currency, customerId } = data;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, provider: { include: { user: true } } }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.customer_id !== customerId) {
      throw new Error('Unauthorized to pay for this booking');
    }

    if (booking.payment_status === 'PAID') {
      throw new Error('Booking is already paid');
    }

    // Calculate commission
    const commissionData = await commissionService.calculateCommission(amount);
    
    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        booking_id: bookingId,
        txn_provider: 'MTN_MOMO',
        payer_id: customerId,
        payee_id: booking.provider.user_id,
        amount: amount,
        currency: currency,
        status: 'INITIATED',
        metadata: {
          phoneNumber,
          paymentMethod: 'MTN_MOMO',
          commission: commissionData.commissionAmount
        }
      }
    });

    // In a real implementation, you would integrate with MTN MoMo API here
    // For now, we'll simulate the payment process
    const momoResponse = await this.simulateMomoPayment(phoneNumber, amount);

    if (momoResponse.success) {
      // Update transaction status
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { 
          status: 'SUCCESS',
          metadata: {
            ...transaction.metadata,
            momoTransactionId: momoResponse.transactionId,
            momoResponse: momoResponse
          }
        }
      });

      // Update booking payment status
      await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          payment_status: 'PAID',
          commission_amount: commissionData.commissionAmount
        }
      });

      // Record commission
      await commissionService.recordCommission(bookingId, amount, commissionData.commissionAmount);

      // Send payment success notification
      await notificationService.sendPaymentSuccessNotification(bookingId, customerId, amount);

      // Log payment transaction
      await auditHelpers.logPaymentTransaction(transaction.id, customerId, amount, 'SUCCESS');

      return {
        transactionId: transaction.id,
        status: 'SUCCESS',
        amount: amount,
        commission: commissionData.commissionAmount,
        momoTransactionId: momoResponse.transactionId
      };
    } else {
      // Update transaction status to failed
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { 
          status: 'FAILED',
          metadata: {
            ...transaction.metadata,
            error: momoResponse.error
          }
        }
      });

      // Send payment failure notification
      await notificationService.sendPaymentFailureNotification(bookingId, customerId, momoResponse.error);

      // Log payment transaction
      await auditHelpers.logPaymentTransaction(transaction.id, customerId, amount, 'FAILED');

      throw new Error(momoResponse.error || 'Payment failed');
    }
  }

  /**
   * Confirm manual payment - FR-14
   */
  async confirmManualPayment(data: ManualPaymentData) {
    const { bookingId, transactionReference, amount, phoneNumber, paymentMethod, customerId } = data;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, provider: { include: { user: true } } }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.customer_id !== customerId) {
      throw new Error('Unauthorized to pay for this booking');
    }

    if (booking.payment_status === 'PAID') {
      throw new Error('Booking is already paid');
    }

    // Calculate commission
    const commissionData = await commissionService.calculateCommission(amount);

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        booking_id: bookingId,
        txn_provider: 'MANUAL_CONFIRMATION',
        payer_id: customerId,
        payee_id: booking.provider.user_id,
        amount: amount,
        currency: 'GHS',
        status: 'SUCCESS',
        metadata: {
          transactionReference,
          phoneNumber,
          paymentMethod,
          commission: commissionData.commissionAmount,
          confirmedBy: customerId
        }
      }
    });

    // Update booking payment status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        payment_status: 'PAID',
        commission_amount: commissionData.commissionAmount
      }
    });

    // Record commission
    await commissionService.recordCommission(bookingId, amount, commissionData.commissionAmount);

    // Send payment success notification
    await notificationService.sendPaymentSuccessNotification(bookingId, customerId, amount);

    // Log payment transaction
    await auditHelpers.logPaymentTransaction(transaction.id, customerId, amount, 'SUCCESS');

    return {
      transactionId: transaction.id,
      status: 'SUCCESS',
      amount: amount,
      commission: commissionData.commissionAmount,
      transactionReference
    };
  }

  /**
   * Update payment status (webhook or manual)
   */
  async updatePaymentStatus(transactionId: string, status: string, providerResponse?: any) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { booking: true }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: { 
        status: status as any,
        metadata: {
          ...transaction.metadata,
          providerResponse,
          updatedAt: new Date()
        }
      }
    });

    // Update booking payment status if payment was successful
    if (status === 'SUCCESS' && transaction.booking.payment_status !== 'PAID') {
      await prisma.booking.update({
        where: { id: transaction.booking_id },
        data: { payment_status: 'PAID' }
      });

      // Send notification
      await notificationService.sendPaymentSuccessNotification(
        transaction.booking_id,
        transaction.payer_id!,
        Number(transaction.amount)
      );
    } else if (status === 'FAILED') {
      await notificationService.sendPaymentFailureNotification(
        transaction.booking_id,
        transaction.payer_id!,
        'Payment verification failed'
      );
    }

    return updatedTransaction;
  }

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(userId: string, filters: { page: number; limit: number }) {
    const { page, limit } = filters;

    const [payments, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          OR: [
            { payer_id: userId },
            { payee_id: userId }
          ]
        },
        include: {
          booking: {
            include: {
              customer: { select: { name: true, email: true } },
              provider: { 
                include: { 
                  user: { select: { name: true, email: true } } 
                } 
              }
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.transaction.count({
        where: {
          OR: [
            { payer_id: userId },
            { payee_id: userId }
          ]
        }
      })
    ]);

    return { payments, total };
  }

  /**
   * Process refund
   */
  async processRefund(bookingId: string, amount: number, reason: string, adminId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.payment_status !== 'PAID') {
      throw new Error('Booking is not paid');
    }

    // Create refund transaction
    const refundTransaction = await prisma.transaction.create({
      data: {
        booking_id: bookingId,
        txn_provider: 'REFUND',
        payer_id: booking.customer_id,
        amount: amount,
        currency: 'GHS',
        status: 'SUCCESS',
        metadata: {
          type: 'REFUND',
          reason,
          processedBy: adminId,
          originalAmount: Number(booking.total_amount)
        }
      }
    });

    // Update booking payment status
    await prisma.booking.update({
      where: { id: bookingId },
      data: { payment_status: 'REFUNDED' }
    });

    // Send notification to customer
    await notificationService.sendNotification({
      userId: booking.customer_id,
      type: 'PAYMENT_SUCCESS',
      title: 'Refund Processed',
      message: `A refund of GHS ${amount} has been processed for your booking.`,
      data: { bookingId, refundAmount: amount },
      channels: ['email', 'sms']
    });

    return refundTransaction;
  }

  /**
   * Simulate MTN MoMo payment (for development)
   */
  private async simulateMomoPayment(phoneNumber: string, amount: number): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success/failure based on phone number
    const isSuccess = !phoneNumber.endsWith('0'); // Fail if phone ends with 0

    if (isSuccess) {
      return {
        success: true,
        transactionId: `MOMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: 'Insufficient funds'
      };
    }
  }
}

export const paymentService = new PaymentService();