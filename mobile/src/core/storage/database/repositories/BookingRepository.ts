import { BaseRepository } from './BaseRepository';
import { BookingRow } from '../schema';

/**
 * Booking interface for cached bookings
 */
export interface CachedBooking {
  id: string;
  data: any; // The actual booking data from API
  lastUpdated: Date;
  syncStatus: 'synced' | 'pending' | 'failed';
}

/**
 * Repository for booking cache operations
 */
export class BookingRepository extends BaseRepository<BookingRow> {
  /**
   * Insert or update a cached booking
   */
  async upsert(booking: CachedBooking): Promise<void> {
    const sql = `
      INSERT OR REPLACE INTO bookings (id, data, lastUpdated, syncStatus)
      VALUES (?, ?, ?, ?);
    `;

    const params = [
      booking.id,
      JSON.stringify(booking.data),
      booking.lastUpdated.getTime(),
      booking.syncStatus,
    ];

    await this.executeUpdate(sql, params);
  }

  /**
   * Insert or update multiple bookings in a transaction
   */
  async upsertBatch(bookings: CachedBooking[]): Promise<void> {
    const operations = bookings.map((booking) => ({
      sql: `
        INSERT OR REPLACE INTO bookings (id, data, lastUpdated, syncStatus)
        VALUES (?, ?, ?, ?);
      `,
      params: [
        booking.id,
        JSON.stringify(booking.data),
        booking.lastUpdated.getTime(),
        booking.syncStatus,
      ],
    }));

    await this.executeTransaction(operations);
  }

  /**
   * Get a cached booking by ID
   */
  async getById(id: string): Promise<CachedBooking | null> {
    const sql = 'SELECT * FROM bookings WHERE id = ?;';
    const row = await this.executeQuerySingle<BookingRow>(sql, [id]);
    return row ? this.mapRowToBooking(row) : null;
  }

  /**
   * Get all cached bookings
   */
  async getAll(): Promise<CachedBooking[]> {
    const sql = 'SELECT * FROM bookings ORDER BY lastUpdated DESC;';
    const rows = await this.executeQuery<BookingRow>(sql);
    return rows.map(this.mapRowToBooking);
  }

  /**
   * Get bookings updated after a specific time
   */
  async getUpdatedAfter(timestamp: Date): Promise<CachedBooking[]> {
    const sql = `
      SELECT * FROM bookings
      WHERE lastUpdated > ?
      ORDER BY lastUpdated DESC;
    `;
    const rows = await this.executeQuery<BookingRow>(sql, [timestamp.getTime()]);
    return rows.map(this.mapRowToBooking);
  }

  /**
   * Get unsynced bookings
   */
  async getUnsyncedBookings(): Promise<CachedBooking[]> {
    const sql = `
      SELECT * FROM bookings
      WHERE syncStatus = 'pending' OR syncStatus = 'failed'
      ORDER BY lastUpdated ASC;
    `;
    const rows = await this.executeQuery<BookingRow>(sql);
    return rows.map(this.mapRowToBooking);
  }

  /**
   * Update booking sync status
   */
  async updateSyncStatus(
    bookingId: string,
    syncStatus: 'synced' | 'pending' | 'failed'
  ): Promise<void> {
    const sql = 'UPDATE bookings SET syncStatus = ? WHERE id = ?;';
    await this.executeUpdate(sql, [syncStatus, bookingId]);
  }

  /**
   * Delete a cached booking
   */
  async delete(bookingId: string): Promise<void> {
    const sql = 'DELETE FROM bookings WHERE id = ?;';
    await this.executeUpdate(sql, [bookingId]);
  }

  /**
   * Delete old cached bookings (older than specified days)
   */
  async deleteOldBookings(daysOld: number): Promise<void> {
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    const sql = 'DELETE FROM bookings WHERE lastUpdated < ?;';
    await this.executeUpdate(sql, [cutoffTime]);
  }

  /**
   * Get count of cached bookings
   */
  async getCount(): Promise<number> {
    const sql = 'SELECT COUNT(*) as count FROM bookings;';
    const result = await this.executeQuerySingle<{ count: number }>(sql);
    return result?.count || 0;
  }

  /**
   * Clear all cached bookings
   */
  async clearAll(): Promise<void> {
    const sql = 'DELETE FROM bookings;';
    await this.executeUpdate(sql);
  }

  /**
   * Get the most recently updated booking
   */
  async getMostRecentlyUpdated(): Promise<CachedBooking | null> {
    const sql = `
      SELECT * FROM bookings
      ORDER BY lastUpdated DESC
      LIMIT 1;
    `;
    const row = await this.executeQuerySingle<BookingRow>(sql);
    return row ? this.mapRowToBooking(row) : null;
  }

  /**
   * Check if a booking exists in cache
   */
  async exists(bookingId: string): Promise<boolean> {
    const sql = 'SELECT COUNT(*) as count FROM bookings WHERE id = ?;';
    const result = await this.executeQuerySingle<{ count: number }>(sql, [bookingId]);
    return (result?.count || 0) > 0;
  }

  /**
   * Map database row to CachedBooking object
   */
  private mapRowToBooking(row: BookingRow): CachedBooking {
    return {
      id: row.id,
      data: JSON.parse(row.data),
      lastUpdated: new Date(row.lastUpdated),
      syncStatus: row.syncStatus,
    };
  }
}

// Export singleton instance
export const bookingRepository = new BookingRepository();
