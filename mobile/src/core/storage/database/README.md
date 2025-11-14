# SQLite Database Module

This module provides SQLite database functionality for structured data storage, specifically for messages and cached bookings.

## Features

- **Database Management**: Automatic initialization, migrations, and version control
- **Repository Pattern**: Clean separation of data access logic
- **Type Safety**: Full TypeScript support with typed interfaces
- **Transaction Support**: Batch operations with ACID guarantees
- **Offline Support**: Sync status tracking for offline-first functionality

## Architecture

```
database/
├── schema.ts                 # Database schema definitions
├── DatabaseManager.ts        # Database initialization and migrations
└── repositories/
    ├── BaseRepository.ts     # Base repository with common operations
    ├── MessageRepository.ts  # Message-specific operations
    └── BookingRepository.ts  # Booking cache operations
```

## Usage

### Initialization

Initialize the database when your app starts:

```typescript
import { databaseManager } from '@/core/storage';

// In your app initialization
await databaseManager.initialize();
```

### Message Operations

```typescript
import { messageRepository, Message } from '@/core/storage';

// Insert a message
const message: Message = {
  id: 'msg-123',
  bookingId: 'booking-456',
  senderId: 'user-1',
  receiverId: 'user-2',
  content: 'Hello!',
  type: 'text',
  isRead: false,
  createdAt: new Date(),
  syncStatus: 'synced',
};

await messageRepository.insert(message);

// Get messages for a booking
const messages = await messageRepository.getByBookingId('booking-456');

// Mark messages as read
await messageRepository.markAllAsReadForBooking('booking-456');

// Get unsynced messages
const unsyncedMessages = await messageRepository.getUnsyncedMessages();

// Update sync status
await messageRepository.updateSyncStatus('msg-123', 'synced');

// Delete old messages (older than 30 days)
await messageRepository.deleteOldMessages(30);
```

### Booking Cache Operations

```typescript
import { bookingRepository, CachedBooking } from '@/core/storage';

// Cache a booking
const cachedBooking: CachedBooking = {
  id: 'booking-123',
  data: {
    // Your booking data from API
    customerId: 'user-1',
    providerId: 'provider-1',
    status: 'confirmed',
    // ... other booking fields
  },
  lastUpdated: new Date(),
  syncStatus: 'synced',
};

await bookingRepository.upsert(cachedBooking);

// Get a cached booking
const booking = await bookingRepository.getById('booking-123');

// Get all cached bookings
const allBookings = await bookingRepository.getAll();

// Get unsynced bookings
const unsyncedBookings = await bookingRepository.getUnsyncedBookings();

// Update sync status
await bookingRepository.updateSyncStatus('booking-123', 'pending');

// Delete old bookings (older than 7 days)
await bookingRepository.deleteOldBookings(7);
```

### Batch Operations

```typescript
// Insert multiple messages in a transaction
const messages: Message[] = [
  // ... array of messages
];
await messageRepository.insertBatch(messages);

// Cache multiple bookings in a transaction
const bookings: CachedBooking[] = [
  // ... array of bookings
];
await bookingRepository.upsertBatch(bookings);
```

## Database Schema

### Messages Table

Stores chat messages for offline access and sync.

| Column      | Type    | Description                           |
|-------------|---------|---------------------------------------|
| id          | TEXT    | Primary key, message ID               |
| bookingId   | TEXT    | Foreign key to bookings               |
| senderId    | TEXT    | User ID of sender                     |
| receiverId  | TEXT    | User ID of receiver                   |
| content     | TEXT    | Message content                       |
| type        | TEXT    | Message type (text/image/system)      |
| isRead      | INTEGER | Read status (0 or 1)                  |
| createdAt   | INTEGER | Unix timestamp                        |
| syncStatus  | TEXT    | Sync status (synced/pending/failed)   |

### Bookings Table

Caches booking data for offline access.

| Column      | Type    | Description                           |
|-------------|---------|---------------------------------------|
| id          | TEXT    | Primary key, booking ID               |
| data        | TEXT    | JSON stringified booking data         |
| lastUpdated | INTEGER | Unix timestamp of last update         |
| syncStatus  | TEXT    | Sync status (synced/pending/failed)   |

## Migrations

The database supports versioned migrations. To add a new migration:

1. Increment `DATABASE_VERSION` in `schema.ts`
2. Add migration logic in `DatabaseManager.runMigrations()`
3. Create a new migration method (e.g., `migrateToVersion2()`)

Example:

```typescript
private async runMigrations(fromVersion: number, toVersion: number): Promise<void> {
  if (fromVersion === 0 && toVersion >= 1) {
    await this.migrateToVersion1();
  }
  
  // Add new migration
  if (fromVersion <= 1 && toVersion >= 2) {
    await this.migrateToVersion2();
  }
  
  await this.setDatabaseVersion(toVersion);
}

private async migrateToVersion2(): Promise<void> {
  // Add new column, create new table, etc.
  await this.db.executeSql('ALTER TABLE messages ADD COLUMN metadata TEXT;');
}
```

## Best Practices

1. **Always initialize**: Call `databaseManager.initialize()` before using repositories
2. **Use transactions**: For multiple related operations, use batch methods
3. **Handle errors**: Wrap database operations in try-catch blocks
4. **Clean up old data**: Periodically delete old messages and bookings
5. **Sync status**: Track sync status for offline-first functionality
6. **Type safety**: Use the provided TypeScript interfaces

## Error Handling

```typescript
try {
  await messageRepository.insert(message);
} catch (error) {
  console.error('Failed to insert message:', error);
  // Handle error appropriately
}
```

## Testing

The database module can be tested using Jest:

```typescript
import { databaseManager, messageRepository } from '@/core/storage';

beforeAll(async () => {
  await databaseManager.initialize();
});

afterAll(async () => {
  await databaseManager.close();
});

test('should insert and retrieve message', async () => {
  const message: Message = {
    // ... message data
  };
  
  await messageRepository.insert(message);
  const retrieved = await messageRepository.getById(message.id);
  
  expect(retrieved).toEqual(message);
});
```

## Performance Considerations

- **Indexes**: The schema includes indexes on frequently queried columns
- **Batch operations**: Use batch methods for multiple operations
- **Pagination**: For large result sets, implement pagination
- **Cleanup**: Regularly delete old data to maintain performance

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 13.1**: Secure storage for authentication tokens (via Keychain)
- **Requirement 1.8**: Token storage and retrieval
- **Requirement 14.8**: Fast key-value storage for user preferences (via MMKV)
- **Requirement 14.9**: Structured data storage for messages
- **Requirement 14.10**: Offline action queue storage
- **Requirement 6.2**: Message history storage and retrieval
