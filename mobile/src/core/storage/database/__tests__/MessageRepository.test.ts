import { databaseManager, messageRepository, Message } from '../index';

describe('MessageRepository', () => {
  beforeAll(async () => {
    await databaseManager.initialize();
  });

  afterAll(async () => {
    await databaseManager.close();
  });

  beforeEach(async () => {
    // Clear messages before each test
    await databaseManager.clearAllData();
  });

  const createMockMessage = (overrides?: Partial<Message>): Message => ({
    id: 'msg-1',
    bookingId: 'booking-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    content: 'Test message',
    type: 'text',
    isRead: false,
    createdAt: new Date(),
    syncStatus: 'synced',
    ...overrides,
  });

  describe('insert', () => {
    it('should insert a message successfully', async () => {
      const message = createMockMessage();
      await messageRepository.insert(message);

      const retrieved = await messageRepository.getById(message.id);
      expect(retrieved).toBeTruthy();
      expect(retrieved?.id).toBe(message.id);
      expect(retrieved?.content).toBe(message.content);
    });
  });

  describe('getByBookingId', () => {
    it('should retrieve messages for a booking', async () => {
      const message1 = createMockMessage({ id: 'msg-1', bookingId: 'booking-1' });
      const message2 = createMockMessage({ id: 'msg-2', bookingId: 'booking-1' });
      const message3 = createMockMessage({ id: 'msg-3', bookingId: 'booking-2' });

      await messageRepository.insert(message1);
      await messageRepository.insert(message2);
      await messageRepository.insert(message3);

      const messages = await messageRepository.getByBookingId('booking-1');
      expect(messages).toHaveLength(2);
      expect(messages.map(m => m.id)).toContain('msg-1');
      expect(messages.map(m => m.id)).toContain('msg-2');
    });

    it('should return empty array for booking with no messages', async () => {
      const messages = await messageRepository.getByBookingId('non-existent');
      expect(messages).toHaveLength(0);
    });
  });

  describe('markAsRead', () => {
    it('should mark a message as read', async () => {
      const message = createMockMessage({ isRead: false });
      await messageRepository.insert(message);

      await messageRepository.markAsRead(message.id);

      const retrieved = await messageRepository.getById(message.id);
      expect(retrieved?.isRead).toBe(true);
    });
  });

  describe('markAllAsReadForBooking', () => {
    it('should mark all messages in a booking as read', async () => {
      const message1 = createMockMessage({ id: 'msg-1', isRead: false });
      const message2 = createMockMessage({ id: 'msg-2', isRead: false });

      await messageRepository.insert(message1);
      await messageRepository.insert(message2);

      await messageRepository.markAllAsReadForBooking('booking-1');

      const messages = await messageRepository.getByBookingId('booking-1');
      expect(messages.every(m => m.isRead)).toBe(true);
    });
  });

  describe('getUnsyncedMessages', () => {
    it('should retrieve unsynced messages', async () => {
      const syncedMessage = createMockMessage({ id: 'msg-1', syncStatus: 'synced' });
      const pendingMessage = createMockMessage({ id: 'msg-2', syncStatus: 'pending' });
      const failedMessage = createMockMessage({ id: 'msg-3', syncStatus: 'failed' });

      await messageRepository.insert(syncedMessage);
      await messageRepository.insert(pendingMessage);
      await messageRepository.insert(failedMessage);

      const unsyncedMessages = await messageRepository.getUnsyncedMessages();
      expect(unsyncedMessages).toHaveLength(2);
      expect(unsyncedMessages.map(m => m.id)).toContain('msg-2');
      expect(unsyncedMessages.map(m => m.id)).toContain('msg-3');
    });
  });

  describe('insertBatch', () => {
    it('should insert multiple messages in a transaction', async () => {
      const messages = [
        createMockMessage({ id: 'msg-1' }),
        createMockMessage({ id: 'msg-2' }),
        createMockMessage({ id: 'msg-3' }),
      ];

      await messageRepository.insertBatch(messages);

      const retrieved = await messageRepository.getByBookingId('booking-1');
      expect(retrieved).toHaveLength(3);
    });
  });

  describe('getCountByBookingId', () => {
    it('should return correct message count', async () => {
      const message1 = createMockMessage({ id: 'msg-1' });
      const message2 = createMockMessage({ id: 'msg-2' });

      await messageRepository.insert(message1);
      await messageRepository.insert(message2);

      const count = await messageRepository.getCountByBookingId('booking-1');
      expect(count).toBe(2);
    });
  });

  describe('getUnreadCountByBookingId', () => {
    it('should return correct unread message count', async () => {
      const readMessage = createMockMessage({ id: 'msg-1', isRead: true });
      const unreadMessage1 = createMockMessage({ id: 'msg-2', isRead: false });
      const unreadMessage2 = createMockMessage({ id: 'msg-3', isRead: false });

      await messageRepository.insert(readMessage);
      await messageRepository.insert(unreadMessage1);
      await messageRepository.insert(unreadMessage2);

      const count = await messageRepository.getUnreadCountByBookingId('booking-1');
      expect(count).toBe(2);
    });
  });

  describe('delete', () => {
    it('should delete a message', async () => {
      const message = createMockMessage();
      await messageRepository.insert(message);

      await messageRepository.delete(message.id);

      const retrieved = await messageRepository.getById(message.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('deleteByBookingId', () => {
    it('should delete all messages for a booking', async () => {
      const message1 = createMockMessage({ id: 'msg-1' });
      const message2 = createMockMessage({ id: 'msg-2' });

      await messageRepository.insert(message1);
      await messageRepository.insert(message2);

      await messageRepository.deleteByBookingId('booking-1');

      const messages = await messageRepository.getByBookingId('booking-1');
      expect(messages).toHaveLength(0);
    });
  });
});
