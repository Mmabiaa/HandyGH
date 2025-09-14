import { Queue, Worker } from 'bullmq';
import { PaymentService } from '../services/payment.service';
import { logger } from '../utils/logger';
import { redisConnection } from '../config/redis.config';

const paymentReconciliationQueue = new Queue('payment-reconciliation', {
  connection: redisConnection,
});

const paymentReconciliationWorker = new Worker('payment-reconciliation', async (job) => {
  try {
    const { transactionId } = job.data;
    const paymentService = new PaymentService();

    // Reconcile payment
    const result = await paymentService.reconcilePayment(transactionId);
    logger.info(`Payment reconciliation successful for transaction ID: ${transactionId}`, result);
  } catch (error) {
    logger.error(`Payment reconciliation failed: ${error.message}`);
    throw error; // Rethrow to mark job as failed
  }
});

// Function to add a job to the queue
export const addPaymentReconciliationJob = (transactionId: string) => {
  paymentReconciliationQueue.add('reconcile', { transactionId });
};