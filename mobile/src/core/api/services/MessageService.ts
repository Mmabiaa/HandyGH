import { apiClient } from '../client';
import {
  Message,
  SendMessageRequest,
  MessageHistoryResponse,
} from '../types';

/**
 * Service for message-related API operations
 */
class MessageService {
  /**
   * Get message history for a booking
   */
  async getMessageHistory(bookingId: string): Promise<Message[]> {
    const response = await apiClient.get<MessageHistoryResponse>(
      `/api/v1/bookings/${bookingId}/messages/`
    );
    return response.data.messages;
  }

  /**
   * Send a message (via HTTP as fallback)
   * Primary message sending should use WebSocket
   */
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    const response = await apiClient.post<Message>(
      `/api/v1/bookings/${data.bookingId}/messages/`,
      {
        content: data.content,
        type: data.type || 'text',
      }
    );
    return response.data;
  }

  /**
   * Mark messages as read
   */
  async markAsRead(bookingId: string, messageIds: string[]): Promise<void> {
    await apiClient.post(
      `/api/v1/bookings/${bookingId}/messages/mark-read/`,
      { messageIds }
    );
  }

  /**
   * Mark all messages in a booking as read
   */
  async markAllAsRead(bookingId: string): Promise<void> {
    await apiClient.post(
      `/api/v1/bookings/${bookingId}/messages/mark-all-read/`
    );
  }
}

export const messageService = new MessageService();
export default messageService;
