import { Queue, Worker } from 'bullmq';
import { sendNotification } from '../services/notification.service';
import { NotificationPayload } from '../types/common.d';

// Create a queue for notifications
const notificationQueue = new Queue<NotificationPayload>('notificationQueue');

// Worker to process notification jobs
const notificationWorker = new Worker<NotificationPayload>('notificationQueue', async (job) => {
  const { recipient, message } = job.data;
  try {
    await sendNotification(recipient, message);
    console.log(`Notification sent to ${recipient}`);
  } catch (error) {
    console.error(`Failed to send notification to ${recipient}:`, error);
    throw error; // Rethrow to allow BullMQ to handle retries
  }
});

// Function to add a notification job to the queue
export const addNotificationJob = async (recipient: string, message: string) => {
  await notificationQueue.add('sendNotification', { recipient, message });
};

// Export the notification queue and worker for use in other parts of the application
export { notificationQueue, notificationWorker };