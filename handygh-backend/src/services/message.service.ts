import { prisma } from '../models/prismaClient';
import { notificationService } from '../utils/notification';

interface CreateMessageData {
  bookingId: string;
  senderId: string;
  content: string;
  attachments?: string[];
}

interface MessageFilters {
  page: number;
  limit: number;
  userId: string;
}

class MessageService {
  /**
   * Create a message - FR-18
   */
  async createMessage(data: CreateMessageData) {
    const { bookingId, senderId, content, attachments = [] } = data;

    // Verify booking exists and user has access
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        provider: { include: { user: true } }
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if user is involved in the booking
    const isCustomer = booking.customer_id === senderId;
    const isProvider = booking.provider_id === senderId;
    
    if (!isCustomer && !isProvider) {
      throw new Error('Unauthorized to send message to this booking');
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        booking_id: bookingId,
        sender_id: senderId,
        content,
        attachments
      },
      include: {
        booking: {
          include: {
            customer: { select: { name: true } },
            provider: { 
              include: { 
                user: { select: { name: true } } 
              } 
            }
          }
        }
      }
    });

    // Determine recipient
    const recipientId = isCustomer ? booking.provider.user_id : booking.customer_id;
    const senderName = isCustomer ? booking.customer.name : booking.provider.user.name;

    // Send notification to recipient
    await notificationService.sendMessageReceivedNotification(
      bookingId,
      recipientId,
      senderName || 'Someone'
    );

    return message;
  }

  /**
   * Get messages for a booking - FR-18
   */
  async getMessagesByBookingId(bookingId: string, filters: MessageFilters) {
    const { page, limit, userId } = filters;

    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { customer_id: true, provider_id: true }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const isCustomer = booking.customer_id === userId;
    const isProvider = booking.provider_id === userId;
    
    if (!isCustomer && !isProvider) {
      throw new Error('Unauthorized to view messages for this booking');
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { booking_id: bookingId },
        include: {
          booking: {
            include: {
              customer: { select: { name: true, email: true } },
              provider: { 
                include: { 
                  user: { select: { name: true, email: true } } 
                } 
              }
            }
          }
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' }
      }),
      prisma.message.count({ where: { booking_id: bookingId } })
    ]);

    return { messages, total };
  }

  /**
   * Update a message
   */
  async updateMessage(messageId: string, userId: string, updateData: { content?: string; attachments?: string[] }) {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender_id !== userId) {
      throw new Error('Unauthorized to update this message');
    }

    // Check if message is too old to edit (e.g., 1 hour)
    const messageAge = Date.now() - message.created_at.getTime();
    const oneHour = 60 * 60 * 1000;
    
    if (messageAge > oneHour) {
      throw new Error('Message is too old to edit');
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        ...updateData,
        updated_at: new Date()
      }
    });

    return updatedMessage;
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, userId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.sender_id !== userId) {
      throw new Error('Unauthorized to delete this message');
    }

    // Check if message is too old to delete (e.g., 1 hour)
    const messageAge = Date.now() - message.created_at.getTime();
    const oneHour = 60 * 60 * 1000;
    
    if (messageAge > oneHour) {
      throw new Error('Message is too old to delete');
    }

    await prisma.message.delete({
      where: { id: messageId }
    });

    return { message: 'Message deleted successfully' };
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(bookingId: string, userId: string) {
    // Verify user has access to this booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { customer_id: true, provider_id: true }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    const isCustomer = booking.customer_id === userId;
    const isProvider = booking.provider_id === userId;
    
    if (!isCustomer && !isProvider) {
      throw new Error('Unauthorized to mark messages as read for this booking');
    }

    // Mark all unread messages as read
    await prisma.message.updateMany({
      where: {
        booking_id: bookingId,
        sender_id: { not: userId }, // Don't mark own messages as read
        is_read: false
      },
      data: { is_read: true }
    });

    return { message: 'Messages marked as read' };
  }

  /**
   * Get unread message count for user
   */
  async getUnreadCount(userId: string) {
    // Get all bookings where user is involved
    const userBookings = await prisma.booking.findMany({
      where: {
        OR: [
          { customer_id: userId },
          { provider_id: userId }
        ]
      },
      select: { id: true }
    });

    const bookingIds = userBookings.map(booking => booking.id);

    if (bookingIds.length === 0) {
      return 0;
    }

    // Count unread messages where user is not the sender
    const unreadCount = await prisma.message.count({
      where: {
        booking_id: { in: bookingIds },
        sender_id: { not: userId },
        is_read: false
      }
    });

    return unreadCount;
  }

  /**
   * Get recent conversations for user
   */
  async getRecentConversations(userId: string, limit = 10) {
    // Get all bookings where user is involved
    const userBookings = await prisma.booking.findMany({
      where: {
        OR: [
          { customer_id: userId },
          { provider_id: userId }
        ]
      },
      include: {
        customer: { select: { name: true, email: true } },
        provider: { 
          include: { 
            user: { select: { name: true, email: true } } 
          } 
        },
        messages: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      },
      orderBy: { updated_at: 'desc' },
      take: limit
    });

    return userBookings.map(booking => ({
      bookingId: booking.id,
      bookingRef: booking.booking_ref,
      status: booking.status,
      otherParty: booking.customer_id === userId 
        ? booking.provider.user 
        : booking.customer,
      lastMessage: booking.messages[0] || null,
      unreadCount: 0 // This would need to be calculated separately
    }));
  }
}

export const messageService = new MessageService();