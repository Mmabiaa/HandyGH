import { Booking } from '../models/prisma/schema';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProviderAvailability(
  providerId: string,
  start: Date,
  end: Date,
  excludeBookingId?: string
): Promise<boolean> {
  const overlappingBookings = await prisma.booking.findMany({
    where: {
      providerId,
      status: {
        in: ['CONFIRMED', 'IN_PROGRESS'], // Only check for confirmed or in-progress bookings
      },
      OR: [
        {
          scheduledStart: {
            lte: end,
          },
          scheduledEnd: {
            gte: start,
          },
        },
        {
          scheduledStart: {
            gte: start,
            lte: end,
          },
        },
      ],
    },
  });

  // Exclude the current booking if provided
  if (excludeBookingId) {
    return overlappingBookings.length === 0 || !overlappingBookings.some(booking => booking.id === excludeBookingId);
  }

  return overlappingBookings.length === 0;
}

export { checkProviderAvailability };