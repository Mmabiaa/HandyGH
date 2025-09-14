import { PrismaClient } from '@prisma/client';
import { PaymentStatus, TransactionStatus } from '../types/payment';
import { Booking } from '../models/prisma/schema.prisma';
import { createPaymentTransaction } from '../utils/paymentGateway'; // Assume this utility handles payment gateway interactions
import { sendPaymentNotification } from './notification.service';

const prisma = new PrismaClient();

export class PaymentService {
  async initiatePayment(bookingId: string, amount: number) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { provider: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const transaction = await prisma.transaction.create({
      data: {
        bookingId: booking.id,
        amount,
        status: TransactionStatus.INITIATED,
      },
    });

    const paymentResponse = await createPaymentTransaction(transaction.id, amount);

    if (paymentResponse.success) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.SUCCESS,
        },
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
        },
      });

      await sendPaymentNotification(booking.provider.userId, booking.id, amount);
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.FAILED,
        },
      });
      throw new Error('Payment failed');
    }

    return paymentResponse;
  }

  async confirmPayment(transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.INITIATED) {
      throw new Error('Transaction is not in a valid state for confirmation');
    }

    // Logic to confirm payment with the payment gateway
    const confirmationResponse = await confirmPaymentWithGateway(transactionId);

    if (confirmationResponse.success) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.SUCCESS,
        },
      });
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: TransactionStatus.FAILED,
        },
      });
      throw new Error('Payment confirmation failed');
    }

    return confirmationResponse;
  }
}