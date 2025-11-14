/**
 * Database schema definitions for SQLite
 * Defines tables for messages and cached bookings
 */

export const DATABASE_NAME = 'handygh.db';
export const DATABASE_VERSION = 1;

/**
 * SQL statements for creating tables
 */
export const CREATE_TABLES = {
  messages: `
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      bookingId TEXT NOT NULL,
      senderId TEXT NOT NULL,
      receiverId TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT NOT NULL,
      isRead INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'synced',
      FOREIGN KEY (bookingId) REFERENCES bookings(id)
    );
  `,

  bookings: `
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      lastUpdated INTEGER NOT NULL,
      syncStatus TEXT DEFAULT 'synced'
    );
  `,
};

/**
 * SQL statements for creating indexes
 */
export const CREATE_INDEXES = {
  messagesBooking: `
    CREATE INDEX IF NOT EXISTS idx_messages_booking
    ON messages(bookingId);
  `,

  messagesCreated: `
    CREATE INDEX IF NOT EXISTS idx_messages_created
    ON messages(createdAt);
  `,

  bookingsUpdated: `
    CREATE INDEX IF NOT EXISTS idx_bookings_updated
    ON bookings(lastUpdated);
  `,
};

/**
 * SQL statements for dropping tables (used in migrations)
 */
export const DROP_TABLES = {
  messages: 'DROP TABLE IF EXISTS messages;',
  bookings: 'DROP TABLE IF EXISTS bookings;',
};

/**
 * Message table interface
 */
export interface MessageRow {
  id: string;
  bookingId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'system';
  isRead: number; // SQLite boolean (0 or 1)
  createdAt: number; // Unix timestamp
  syncStatus: 'synced' | 'pending' | 'failed';
}

/**
 * Booking table interface
 */
export interface BookingRow {
  id: string;
  data: string; // JSON stringified booking data
  lastUpdated: number; // Unix timestamp
  syncStatus: 'synced' | 'pending' | 'failed';
}
