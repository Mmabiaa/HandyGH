import { databaseManager, bookingRepository, CachedBooking } from '../index';

describe('BookingRepository', () => {
  beforeAll(async () => {
    await databaseManager.initialize();
  });

  afterAll(async () => {
    await databaseManager.close();
  });

  beforeEach(async () => {
    // Clear bookings before each test
    await databaseManager.clearAllData();
  });

  const createMockBooking = (overrides?: Partial<CachedBooking>): CachedBooking => ({
    id: 'booking-1',
    data: {
      customerId: 'user-1',
      providerId: 'provider-1',
      status: 'confirmed',
      serviceId: 'service-1',
    },
    lastUpdated: new Date(),
    syncStatus: 'synced',
    ...overrides,
  });

  describe('upsert', () => {
    it('should insert a new booking', async () => {
      const booking = createMockBooking();
      await bookingRepository.upsert(booking);

      const retrieved = await bookingRepository.getById(booking.id);
      expect(retrieved).toBeTruthy();
      expect(retrieved?.id).toBe(booking.id);
      expect(retrieved?.data).toEqual(booking.data);
    });

    it('should update an existing booking', async () => {
      const booking = createMockBooking();
      await bookingRepository.upsert(booking);

      const updatedBooking = {
        ...booking,
        data: { ...booking.data, status: 'completed' },
        lastUpdated: new Date(),
      };
      await bookingRepository.upsert(updatedBooking);

      const retrieved = await bookingRepository.getById(booking.id);
      expect(retrieved?.data.status).toBe('completed');
    });
  });

  describe('getAll', () => {
    it('should retrieve all bookings', async () => {
      const booking1 = createMockBooking({ id: 'booking-1' });
      const booking2 = createMockBooking({ id: 'booking-2' });

      await bookingRepository.upsert(booking1);
      await bookingRepository.upsert(booking2);

      const bookings = await bookingRepository.getAll();
      expect(bookings).toHaveLength(2);
    });

    it('should return empty array when no bookings exist', async () => {
      const bookings = await bookingRepository.getAll();
      expect(bookings).toHaveLength(0);
    });
  });

  describe('getUnsyncedBookings', () => {
    it('should retrieve unsynced bookings', async () => {
      const syncedBooking = createMockBooking({ id: 'booking-1', syncStatus: 'synced' });
      const pendingBooking = createMockBooking({ id: 'booking-2', syncStatus: 'pending' });
      const failedBooking = createMockBooking({ id: 'booking-3', syncStatus: 'failed' });

      await bookingRepository.upsert(syncedBooking);
      await bookingRepository.upsert(pendingBooking);
      await bookingRepository.upsert(failedBooking);

      const unsyncedBookings = await bookingRepository.getUnsyncedBookings();
      expect(unsyncedBookings).toHaveLength(2);
      expect(unsyncedBookings.map(b => b.id)).toContain('booking-2');
      expect(unsyncedBookings.map(b => b.id)).toContain('booking-3');
    });
  });

  describe('updateSyncStatus', () => {
    it('should update booking sync status', async () => {
      const booking = createMockBooking({ syncStatus: 'pending' });
      await bookingRepository.upsert(booking);

      await bookingRepository.updateSyncStatus(booking.id, 'synced');

      const retrieved = await bookingRepository.getById(booking.id);
      expect(retrieved?.syncStatus).toBe('synced');
    });
  });

  describe('upsertBatch', () => {
    it('should insert multiple bookings in a transaction', async () => {
      const bookings = [
        createMockBooking({ id: 'booking-1' }),
        createMockBooking({ id: 'booking-2' }),
        createMockBooking({ id: 'booking-3' }),
      ];

      await bookingRepository.upsertBatch(bookings);

      const retrieved = await bookingRepository.getAll();
      expect(retrieved).toHaveLength(3);
    });
  });

  describe('exists', () => {
    it('should return true if booking exists', async () => {
      const booking = createMockBooking();
      await bookingRepository.upsert(booking);

      const exists = await bookingRepository.exists(booking.id);
      expect(exists).toBe(true);
    });

    it('should return false if booking does not exist', async () => {
      const exists = await bookingRepository.exists('non-existent');
      expect(exists).toBe(false);
    });
  });

  describe('getCount', () => {
    it('should return correct booking count', async () => {
      const booking1 = createMockBooking({ id: 'booking-1' });
      const booking2 = createMockBooking({ id: 'booking-2' });

      await bookingRepository.upsert(booking1);
      await bookingRepository.upsert(booking2);

      const count = await bookingRepository.getCount();
      expect(count).toBe(2);
    });
  });

  describe('delete', () => {
    it('should delete a booking', async () => {
      const booking = createMockBooking();
      await bookingRepository.upsert(booking);

      await bookingRepository.delete(booking.id);

      const retrieved = await bookingRepository.getById(booking.id);
      expect(retrieved).toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should clear all bookings', async () => {
      const booking1 = createMockBooking({ id: 'booking-1' });
      const booking2 = createMockBooking({ id: 'booking-2' });

      await bookingRepository.upsert(booking1);
      await bookingRepository.upsert(booking2);

      await bookingRepository.clearAll();

      const bookings = await bookingRepository.getAll();
      expect(bookings).toHaveLength(0);
    });
  });

  describe('getMostRecentlyUpdated', () => {
    it('should return the most recently updated booking', async () => {
      const oldBooking = createMockBooking({
        id: 'booking-1',
        lastUpdated: new Date('2024-01-01'),
      });
      const newBooking = createMockBooking({
        id: 'booking-2',
        lastUpdated: new Date('2024-12-01'),
      });

      await bookingRepository.upsert(oldBooking);
      await bookingRepository.upsert(newBooking);

      const mostRecent = await bookingRepository.getMostRecentlyUpdated();
      expect(mostRecent?.id).toBe('booking-2');
    });
  });
});
