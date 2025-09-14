import { PrismaClient } from '@prisma/client';
import { Review } from '../models/prisma/schema.prisma';
import { User } from '../models/prisma/schema.prisma';
import { Booking } from '../models/prisma/schema.prisma';

const prisma = new PrismaClient();

class ReviewService {
  async createReview(bookingId: string, customerId: string, rating: number, comment?: string): Promise<Review> {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.customerId !== customerId) {
      throw new Error('Unauthorized: You can only review your own bookings');
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        customerId,
        providerId: booking.providerId,
        rating,
        comment,
      },
    });

    await this.aggregateProviderRating(booking.providerId);
    return review;
  }

  async getProviderReviews(providerId: string): Promise<Review[]> {
    return await prisma.review.findMany({
      where: { providerId },
      include: { customer: true },
    });
  }

  private async aggregateProviderRating(providerId: string): Promise<void> {
    const reviews = await prisma.review.findMany({
      where: { providerId },
    });

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const ratingAvg = totalRating / reviews.length;

    await prisma.provider.update({
      where: { id: providerId },
      data: {
        ratingAvg,
        ratingCount: reviews.length,
      },
    });
  }
}

export default new ReviewService();