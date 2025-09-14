import { Queue } from 'bullmq';
import { prisma } from '../models/prisma/client';
import { calculateAverageRating } from '../services/rating.service';

const ratingQueue = new Queue('ratingAggregationQueue');

ratingQueue.process(async () => {
  const providers = await prisma.provider.findMany({
    include: {
      reviews: true,
    },
  });

  for (const provider of providers) {
    const averageRating = calculateAverageRating(provider.reviews);
    await prisma.provider.update({
      where: { id: provider.id },
      data: {
        ratingAvg: averageRating,
        ratingCount: provider.reviews.length,
      },
    });
  }
});

export default ratingQueue;