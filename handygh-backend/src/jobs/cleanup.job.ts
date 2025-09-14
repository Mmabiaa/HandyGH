import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../config/redis.config';
import { cleanupExpiredData } from '../services/cleanup.service';

const cleanupQueue = new Queue('cleanup', {
  connection: redisConnection,
});

const cleanupWorker = new Worker('cleanup', async () => {
  await cleanupExpiredData();
}, {
  connection: redisConnection,
});

// Schedule the cleanup job to run daily
cleanupQueue.add('dailyCleanup', {}, {
  repeat: { cron: '0 0 * * *' }, // Runs every day at midnight
});

export { cleanupQueue, cleanupWorker };