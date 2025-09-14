import { PrismaClient } from '@prisma/client';
import { Booking, ProviderService } from '../models/prisma/schema.prisma';
import { checkProviderAvailability } from '../utils/availability';
import { generateBookingReference } from '../utils/booking';
import { calculateTotalAmount } from '../utils/payment';

const prisma = new PrismaClient();

export class BookingService {
  async createBooking(data: Booking): Promise<Booking> {
    const { providerId, providerServiceId, scheduledStart, scheduledEnd } = data;

    const isAvailable = await checkProviderAvailability(providerId, scheduledStart, scheduledEnd);
    if (!isAvailable) {
      throw new Error('Provider is not available for the selected time.');
    }

    const bookingRef = generateBookingReference();
    const totalAmount = calculateTotalAmount(providerServiceId);

    const booking = await prisma.booking.create({
      data: {
        ...data,
        bookingRef,
        totalAmount,
        status: 'REQUESTED',
      },
    });

    return booking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return await prisma.booking.findMany({
      where: {
        OR: [
          { customerId: userId },
          { providerId: userId },
        ],
      },
      include: {
        provider: true,
        providerService: true,
      },
    });
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<Booking> {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    return booking;
  }

  async cancelBooking(bookingId: string, reason: string): Promise<Booking> {
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CANCELLED', reason },
    });

    return booking;
  }

  async getBookingDetails(bookingId: string): Promise<Booking> {
    return await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: true,
        providerService: true,
        messages: true,
        review: true,
      },
    });
  }
}