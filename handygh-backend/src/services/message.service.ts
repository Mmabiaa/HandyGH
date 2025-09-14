import { PrismaClient } from '@prisma/client';
import { Message } from '../types/message.d';
import { Booking } from '../types/booking.d';

const prisma = new PrismaClient();

class MessageService {
  async getMessages(bookingId: string): Promise<Message[]> {
    return await prisma.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async sendMessage(bookingId: string, senderId: string, content: string, attachments?: string[]): Promise<Message> {
    const message = await prisma.message.create({
      data: {
        bookingId,
        senderId,
        content,
        attachments,
      },
    });
    return message;
  }

  async uploadAttachment(bookingId: string, senderId: string, fileUrl: string): Promise<Message> {
    const message = await prisma.message.create({
      data: {
        bookingId,
        senderId,
        content: 'Attachment uploaded',
        attachments: [fileUrl],
      },
    });
    return message;
  }
}

export default new MessageService();