import { BaseRepository } from './BaseRepository';
import { MessageRow } from '../schema';

/**
 * Message interface for application use
 */
export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'system';
  isRead: boolean;
  createdAt: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

/**
 * Repository for message operations
 */
export class MessageRepository extends BaseRepository<MessageRow> {
  /**
   * Insert a new message
   */
  async insert(message: Message): Promise<void> {
    const sql = `
      INSERT INTO messages (
        id, bookingId, senderId, receiverId, content, type, isRead, createdAt, syncStatus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const params = [
      message.id,
      message.bookingId,
      message.senderId,
      message.receiverId,
      message.content,
      message.type,
      message.isRead ? 1 : 0,
      message.createdAt.getTime(),
      message.syncStatus,
    ];

    await this.executeUpdate(sql, params);
  }

  /**
   * Insert multiple messages in a transaction
   */
  async insertBatch(messages: Message[]): Promise<void> {
    const operations = messages.map((message) => ({
      sql: `
        INSERT OR REPLACE INTO messages (
          id, bookingId, senderId, receiverId, content, type, isRead, createdAt, syncStatus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      `,
      params: [
        message.id,
        message.bookingId,
        message.senderId,
        message.receiverId,
        message.content,
        message.type,
        message.isRead ? 1 : 0,
        message.createdAt.getTime(),
        message.syncStatus,
      ],
    }));

    await this.executeTransaction(operations);
  }

  /**
   * Get all messages for a booking
   */
  async getByBookingId(bookingId: string): Promise<Message[]> {
    const sql = `
      SELECT * FROM messages
      WHERE bookingId = ?
      ORDER BY createdAt ASC;
    `;

    const rows = await this.executeQuery<MessageRow>(sql, [bookingId]);
    return rows.map(this.mapRowToMessage);
  }

  /**
   * Get a message by ID
   */
  async getById(id: string): Promise<Message | null> {
    const sql = 'SELECT * FROM messages WHERE id = ?;';
    const row = await this.executeQuerySingle<MessageRow>(sql, [id]);
    return row ? this.mapRowToMessage(row) : null;
  }

  /**
   * Update message read status
   */
  async markAsRead(messageId: string): Promise<void> {
    const sql = 'UPDATE messages SET isRead = 1 WHERE id = ?;';
    await this.executeUpdate(sql, [messageId]);
  }

  /**
   * Mark all messages in a booking as read
   */
  async markAllAsReadForBooking(bookingId: string): Promise<void> {
    const sql = 'UPDATE messages SET isRead = 1 WHERE bookingId = ?;';
    await this.executeUpdate(sql, [bookingId]);
  }

  /**
   * Update message sync status
   */
  async updateSyncStatus(
    messageId: string,
    syncStatus: 'synced' | 'pending' | 'failed'
  ): Promise<void> {
    const sql = 'UPDATE messages SET syncStatus = ? WHERE id = ?;';
    await this.executeUpdate(sql, [syncStatus, messageId]);
  }

  /**
   * Get unsynced messages
   */
  async getUnsyncedMessages(): Promise<Message[]> {
    const sql = `
      SELECT * FROM messages
      WHERE syncStatus = 'pending' OR syncStatus = 'failed'
      ORDER BY createdAt ASC;
    `;

    const rows = await this.executeQuery<MessageRow>(sql);
    return rows.map(this.mapRowToMessage);
  }

  /**
   * Delete a message
   */
  async delete(messageId: string): Promise<void> {
    const sql = 'DELETE FROM messages WHERE id = ?;';
    await this.executeUpdate(sql, [messageId]);
  }

  /**
   * Delete all messages for a booking
   */
  async deleteByBookingId(bookingId: string): Promise<void> {
    const sql = 'DELETE FROM messages WHERE bookingId = ?;';
    await this.executeUpdate(sql, [bookingId]);
  }

  /**
   * Delete old messages (older than specified days)
   */
  async deleteOldMessages(daysOld: number): Promise<void> {
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    const sql = 'DELETE FROM messages WHERE createdAt < ?;';
    await this.executeUpdate(sql, [cutoffTime]);
  }

  /**
   * Get message count for a booking
   */
  async getCountByBookingId(bookingId: string): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM messages WHERE bookingId = ?;';
    const result = await this.executeQuerySingle<{ count: number }>(sql, [bookingId]);
    return result?.count || 0;
  }

  /**
   * Get unread message count for a booking
   */
  async getUnreadCountByBookingId(bookingId: string): Promise<number> {
    const sql = `
      SELECT COUNT(*) as count FROM messages
      WHERE bookingId = ? AND isRead = 0;
    `;
    const result = await this.executeQuerySingle<{ count: number }>(sql, [bookingId]);
    return result?.count || 0;
  }

  /**
   * Map database row to Message object
   */
  private mapRowToMessage(row: MessageRow): Message {
    return {
      id: row.id,
      bookingId: row.bookingId,
      senderId: row.senderId,
      receiverId: row.receiverId,
      content: row.content,
      type: row.type,
      isRead: row.isRead === 1,
      createdAt: new Date(row.createdAt),
      syncStatus: row.syncStatus,
    };
  }
}

// Export singleton instance
export const messageRepository = new MessageRepository();
