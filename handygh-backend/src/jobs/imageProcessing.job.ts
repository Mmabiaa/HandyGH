import { Queue, Worker } from 'bullmq';
import { s3Upload } from '../utils/s3';
import { logger } from '../utils/logger';

// Create a queue for image processing
const imageProcessingQueue = new Queue('imageProcessing');

// Worker to process image upload jobs
const imageProcessingWorker = new Worker('imageProcessing', async (job) => {
  try {
    const { imageUrl, userId } = job.data;

    // Process the image (e.g., resize, compress)
    const processedImageUrl = await processImage(imageUrl);

    // Upload the processed image to S3
    const s3Response = await s3Upload(processedImageUrl, userId);

    logger.info(`Image processed and uploaded successfully: ${s3Response.Location}`);
  } catch (error) {
    logger.error(`Failed to process image: ${error.message}`);
    throw error; // Rethrow the error to retry the job
  }
});

// Function to process the image (placeholder for actual processing logic)
async function processImage(imageUrl: string): Promise<string> {
  // Implement image processing logic here (e.g., resizing, filtering)
  // For now, just return the original image URL
  return imageUrl;
}

// Export the queue for adding jobs
export { imageProcessingQueue };