import { prisma } from '../models/prismaClient';

export interface NotificationData {
  userId: string;
  type: 'BOOKING_CREATED' | 'BOOKING_CONFIRMED' | 'BOOKING_DECLINED' | 'BOOKING_IN_PROGRESS' | 'BOOKING_COMPLETED' | 'BOOKING_CANCELLED' | 'PAYMENT_SUCCESS' | 'PAYMENT_FAILED' | 'MESSAGE_RECEIVED' | 'DISPUTE_RAISED' | 'DISPUTE_RESOLVED';
  title: string;
  message: string;
  data?: any;
  channels: ('email' | 'sms' | 'push')[];
}

export async function sendOTPNotification(phone: string, otp: string): Promise<void> {
  // TODO: Integrate with real SMS provider (Twilio, Africa's Talking, etc.)
  console.log(`[DEV] Sending OTP ${otp} to phone ${phone}`);
  
  // In production, integrate with SMS provider:
  // await smsProvider.send(phone, `Your HandyGH verification code is: ${otp}`);
}

export async function sendEmailNotification(email: string, subject: string, message: string): Promise<void> {
  // TODO: Integrate with real email provider (SendGrid, AWS SES, etc.)
  console.log(`[DEV] Sending email to ${email}: ${subject} - ${message}`);
  
  // In production, integrate with email provider:
  // await emailProvider.send({ to: email, subject, html: message });
}

export async function sendPushNotification(userId: string, title: string, message: string, data?: any): Promise<void> {
  // TODO: Integrate with push notification service (Firebase, OneSignal, etc.)
  console.log(`[DEV] Sending push notification to user ${userId}: ${title} - ${message}`);
  
  // In production, integrate with push notification service:
  // await pushService.send(userId, { title, body: message, data });
}

// Comprehensive notification system - FR-19
export class NotificationService {
  /**
   * Send notification through multiple channels
   */
  async sendNotification(notificationData: NotificationData): Promise<void> {
    const { userId, type, title, message, data, channels } = notificationData;
    
    // Store notification in database
    await this.storeNotification(userId, type, title, message, data);
    
    // Send through specified channels
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true }
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'email':
            if (user.email) {
              await sendEmailNotification(user.email, title, message);
            }
            break;
          case 'sms':
            if (user.phone) {
              await sendSMSNotification(user.phone, message);
            }
            break;
          case 'push':
            await sendPushNotification(userId, title, message, data);
            break;
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
        // Continue with other channels even if one fails
      }
    }
  }

  /**
   * Store notification in database
   */
  private async storeNotification(
    userId: string, 
    type: string, 
    title: string, 
    message: string, 
    data?: any
  ): Promise<void> {
    // Note: This would require a notifications table in the database
    // For now, we'll log it
    console.log(`[NOTIFICATION] User ${userId}: ${type} - ${title}: ${message}`);
  }

  /**
   * Send booking created notification
   */
  async sendBookingCreatedNotification(bookingId: string, providerId: string): Promise<void> {
    await this.sendNotification({
      userId: providerId,
      type: 'BOOKING_CREATED',
      title: 'New Booking Request',
      message: 'You have received a new booking request. Please review and respond.',
      data: { bookingId },
      channels: ['email', 'push']
    });
  }

  /**
   * Send booking confirmed notification
   */
  async sendBookingConfirmedNotification(bookingId: string, customerId: string): Promise<void> {
    await this.sendNotification({
      userId: customerId,
      type: 'BOOKING_CONFIRMED',
      title: 'Booking Confirmed',
      message: 'Your booking has been confirmed by the service provider.',
      data: { bookingId },
      channels: ['email', 'sms', 'push']
    });
  }

  /**
   * Send booking declined notification
   */
  async sendBookingDeclinedNotification(bookingId: string, customerId: string, reason?: string): Promise<void> {
    await this.sendNotification({
      userId: customerId,
      type: 'BOOKING_DECLINED',
      title: 'Booking Declined',
      message: reason ? `Your booking was declined: ${reason}` : 'Your booking was declined by the service provider.',
      data: { bookingId },
      channels: ['email', 'push']
    });
  }

  /**
   * Send payment success notification
   */
  async sendPaymentSuccessNotification(bookingId: string, customerId: string, amount: number): Promise<void> {
    await this.sendNotification({
      userId: customerId,
      type: 'PAYMENT_SUCCESS',
      title: 'Payment Successful',
      message: `Your payment of GHS ${amount} has been processed successfully.`,
      data: { bookingId, amount },
      channels: ['email', 'sms']
    });
  }

  /**
   * Send payment failure notification
   */
  async sendPaymentFailureNotification(bookingId: string, customerId: string, reason?: string): Promise<void> {
    await this.sendNotification({
      userId: customerId,
      type: 'PAYMENT_FAILED',
      title: 'Payment Failed',
      message: reason ? `Your payment failed: ${reason}` : 'Your payment could not be processed. Please try again.',
      data: { bookingId },
      channels: ['email', 'push']
    });
  }

  /**
   * Send booking reminder notification
   */
  async sendBookingReminderNotification(bookingId: string, userId: string, reminderType: 'UPCOMING' | 'STARTING_SOON'): Promise<void> {
    const messages = {
      UPCOMING: 'Your booking is coming up soon. Please prepare accordingly.',
      STARTING_SOON: 'Your booking is starting in 30 minutes.'
    };

    await this.sendNotification({
      userId,
      type: 'BOOKING_CREATED', // Could be a separate type
      title: 'Booking Reminder',
      message: messages[reminderType],
      data: { bookingId, reminderType },
      channels: ['email', 'sms', 'push']
    });
  }

  /**
   * Send message received notification
   */
  async sendMessageReceivedNotification(bookingId: string, recipientId: string, senderName: string): Promise<void> {
    await this.sendNotification({
      userId: recipientId,
      type: 'MESSAGE_RECEIVED',
      title: 'New Message',
      message: `You have received a new message from ${senderName}.`,
      data: { bookingId },
      channels: ['push']
    });
  }

  /**
   * Send dispute raised notification
   */
  async sendDisputeRaisedNotification(bookingId: string, adminId: string, disputeReason: string): Promise<void> {
    await this.sendNotification({
      userId: adminId,
      type: 'DISPUTE_RAISED',
      title: 'New Dispute',
      message: `A new dispute has been raised for booking ${bookingId}: ${disputeReason}`,
      data: { bookingId, disputeReason },
      channels: ['email', 'push']
    });
  }
}

export const notificationService = new NotificationService();

// Helper function for SMS notifications
async function sendSMSNotification(phone: string, message: string): Promise<void> {
  // TODO: Integrate with real SMS provider
  console.log(`[DEV] Sending SMS to ${phone}: ${message}`);
}