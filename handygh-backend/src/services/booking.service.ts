import { prisma } from '../models/prismaClient';
import { notificationService } from '../utils/notification';
import { auditHelpers } from '../utils/audit';

interface CreateBookingData {
  customerId: string;
  providerId: string;
  providerServiceId: string;
  scheduledStart: Date;
  scheduledEnd?: Date;
  address: string;
  totalAmount: number;
  notes?: string;
}

interface BookingFilters {
  page: number;
  limit: number;
  status?: string;
  userId?: string;
  role?: string;
}

class BookingService {
  /**
   * Create a new booking - FR-7
   */
  async createBooking(data: CreateBookingData) {
    const { customerId, providerId, providerServiceId, scheduledStart, scheduledEnd, address, totalAmount, notes } = data;

    // Check if provider is available
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: { user: true }
    });

    if (!provider) {
      throw new Error('Provider not found');
    }

    if (!provider.verified) {
      throw new Error('Provider is not verified');
    }

    // Check for conflicting bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        provider_id: providerId,
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        scheduled_start: { lte: scheduledEnd || new Date(scheduledStart.getTime() + 2 * 60 * 60 * 1000) },
        scheduled_end: { gte: scheduledStart }
      }
    });

    if (conflictingBooking) {
      throw new Error('Provider is not available at the requested time');
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        customer_id: customerId,
        provider_id: providerId,
        provider_service_id: providerServiceId,
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
        address,
        total_amount: totalAmount,
        status: 'REQUESTED'
      },
      include: {
        customer: true,
        provider: { include: { user: true } },
        providerService: true
      }
    });

    // Send notification to provider
    await notificationService.sendBookingCreatedNotification(booking.id, providerId);

    // Log booking creation
    await auditHelpers.logBookingCreation(booking.id, customerId, providerId, totalAmount);

    return booking;
  }

  /**
   * Accept a booking - FR-8
   */
  async acceptBooking(bookingId: string, providerId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, provider: { include: { user: true } } }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.provider_id !== providerId) {
      throw new Error('Unauthorized to accept this booking');
    }

    if (booking.status !== 'REQUESTED') {
      throw new Error('Booking cannot be accepted in current status');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: 'CONFIRMED',
        updated_at: new Date()
      },
      include: {
        customer: true,
        provider: { include: { user: true } }
      }
    });

    // Send notification to customer
    await notificationService.sendBookingConfirmedNotification(bookingId, booking.customer_id);

    return updatedBooking;
  }

  /**
   * Decline a booking - FR-8
   */
  async declineBooking(bookingId: string, providerId: string, reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.provider_id !== providerId) {
      throw new Error('Unauthorized to decline this booking');
    }

    if (booking.status !== 'REQUESTED') {
      throw new Error('Booking cannot be declined in current status');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: 'CANCELLED',
        updated_at: new Date()
      }
    });

    // Send notification to customer
    await notificationService.sendBookingDeclinedNotification(bookingId, booking.customer_id, reason);

    return updatedBooking;
  }

  /**
   * Propose new time for booking - FR-8
   */
  async proposeNewTime(bookingId: string, providerId: string, newStartTime: Date, newEndTime: Date, reason: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.provider_id !== providerId) {
      throw new Error('Unauthorized to modify this booking');
    }

    // Check for conflicting bookings with new time
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        provider_id: providerId,
        id: { not: bookingId },
        status: { in: ['CONFIRMED', 'IN_PROGRESS'] },
        scheduled_start: { lte: newEndTime },
        scheduled_end: { gte: newStartTime }
      }
    });

    if (conflictingBooking) {
      throw new Error('Provider is not available at the proposed time');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        scheduled_start: newStartTime,
        scheduled_end: newEndTime,
        updated_at: new Date()
      }
    });

    // Send notification to customer about time change
    await notificationService.sendNotification({
      userId: booking.customer_id,
      type: 'BOOKING_CREATED',
      title: 'Booking Time Changed',
      message: `The provider has proposed a new time for your booking. Reason: ${reason}`,
      data: { bookingId, newStartTime, newEndTime },
      channels: ['email', 'push']
    });

    return updatedBooking;
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId: string, status: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { customer: true, provider: { include: { user: true } } }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check authorization
    const isCustomer = booking.customer_id === userId;
    const isProvider = booking.provider_id === userId;
    
    if (!isCustomer && !isProvider) {
      throw new Error('Unauthorized to update this booking');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: status as any,
        updated_at: new Date()
      },
      include: {
        customer: true,
        provider: { include: { user: true } }
      }
    });

    // Send appropriate notifications
    if (status === 'IN_PROGRESS') {
      await notificationService.sendNotification({
        userId: booking.customer_id,
        type: 'BOOKING_IN_PROGRESS',
        title: 'Service Started',
        message: 'Your service has started.',
        data: { bookingId },
        channels: ['email', 'push']
      });
    } else if (status === 'COMPLETED') {
      await notificationService.sendNotification({
        userId: booking.customer_id,
        type: 'BOOKING_COMPLETED',
        title: 'Service Completed',
        message: 'Your service has been completed. Please rate your experience.',
        data: { bookingId },
        channels: ['email', 'push']
      });
    }

    return updatedBooking;
  }

  /**
   * Get user bookings with filters
   */
  async getUserBookings(userId: string, filters: BookingFilters) {
    const { page, limit, status, role } = filters;
    
    let whereClause: any = {};
    
    if (role === 'CUSTOMER') {
      whereClause.customer_id = userId;
    } else if (role === 'PROVIDER') {
      whereClause.provider_id = userId;
    } else {
      // Admin or both roles
      whereClause.OR = [
        { customer_id: userId },
        { provider_id: userId }
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: whereClause,
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          provider: { 
            include: { 
              user: { select: { id: true, name: true, email: true, phone: true } } 
            } 
          },
          providerService: true,
          transactions: {
            where: { status: 'SUCCESS' }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.booking.count({ where: whereClause })
    ]);

    return { bookings, total };
  }

  /**
   * Get booking details
   */
  async getBookingDetails(bookingId: string) {
    return await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        provider: { 
          include: { 
            user: { select: { id: true, name: true, email: true, phone: true } } 
          } 
        },
        providerService: true,
        transactions: true,
        messages: {
          orderBy: { created_at: 'desc' },
          take: 20
        },
        review: true,
        dispute: true
      }
    });
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, reason: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check authorization
    const isCustomer = booking.customer_id === userId;
    const isProvider = booking.provider_id === userId;
    
    if (!isCustomer && !isProvider) {
      throw new Error('Unauthorized to cancel this booking');
    }

    // Check if booking can be cancelled
    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      throw new Error('Booking cannot be cancelled in current status');
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: 'CANCELLED',
        updated_at: new Date()
      }
    });

    // Handle refund if payment was made
    if (booking.payment_status === 'PAID') {
      // Create refund transaction
      await prisma.transaction.create({
        data: {
          booking_id: bookingId,
          txn_provider: 'BOOKING_CANCELLATION_REFUND',
          amount: booking.total_amount,
          currency: 'GHS',
          status: 'SUCCESS',
          metadata: {
            type: 'REFUND',
            reason: 'Booking cancelled',
            cancelledBy: userId
          }
        }
      });

      // Update booking payment status
      await prisma.booking.update({
        where: { id: bookingId },
        data: { payment_status: 'REFUNDED' }
      });
    }

    return updatedBooking;
  }
}

export const bookingService = new BookingService();