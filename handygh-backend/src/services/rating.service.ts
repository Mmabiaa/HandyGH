import { PrismaClient } from '@prisma/client';
import { Review } from '../models/prisma/schema.prisma';

const prisma = new PrismaClient();

class RatingService {
  async aggregateProviderRating(providerId: string): Promise<number> {
    const reviews = await prisma.review.findMany({
      where: { providerId },
    });

    if (reviews.length === 0) return 0;

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    return parseFloat((totalRating / reviews.length).toFixed(2));
  }

  async createReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const review = await prisma.review.create({
      data: reviewData,
    });

    const newRating = await this.aggregateProviderRating(review.providerId);
    await prisma.provider.update({
      where: { id: review.providerId },
      data: { ratingAvg: newRating, ratingCount: { increment: 1 } },
    });

    return review;
  }

  async getProviderReviews(providerId: string): Promise<Review[]> {
    return await prisma.review.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export default new RatingService();