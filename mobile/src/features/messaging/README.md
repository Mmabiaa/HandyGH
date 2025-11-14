# Messaging Feature

Real-time messaging functionality for HandyGH bookings.

## Overview

The messaging feature enables customers and providers to communicate in real-time about their bookings. It implements WebSocket-based real-time messaging with offline support and message persistence.

## Features

### Real-time Messaging (Requirements 6.1-6.9)
- ✅ WebSocket-based real-time message delivery
- ✅ Message history from API
- ✅ Read receipts
- ✅ Typing indicators
- ✅ Delivery status tracking
- ✅ Offline message queuing
- ✅ SQLite message persistence
- ✅ Automatic sync on reconnection

### Offline Support (Requirements 14.9, 14.10)
- ✅ Messages stored in local SQLite database
- ✅ Offline message sending with queue
- ✅ Automatic sync when connection restored
- ✅ Failed message retry mechanism
- ✅ Optimistic UI updates

## Architecture

### Components

#### BookingChatScreen
Main chat interface with:
- Message list with auto-scroll
- Real-time message updates
- Typing indicators
- Connection status indicator
- Empty/loading/error states

#### MessageBubble
Individual message display with:
- Own vs other message styling
- Read receipts for sent messages
- Timestamps
- System message support

#### ChatInput
Message composition with:
- Multi-line text input
- Send button with disabled state
- Typing indicator emission
- Character limit (1000)

#### TypingIndicator
Animated typing indicator showing when other user is typing.

### Hooks

#### useChat
Main hook for chat functionality:
- Fetches message history from API
- Subscribes to real-time WebSocket events
- Handles message sending (WebSocket + HTTP fallback)
- Manages read receipts
- Tracks typing indicators
- Monitors connection status
- Syncs pending messages on reconnection

### Services

#### MessageService
API service for:
- Fetching message history
- Sending messages (HTTP fallback)
- Marking messages as read

### Storage

#### MessageRepository
SQLite repository for:
- Storing messages locally
- Batch message insertion
- Querying by booking ID
- Marking messages as read
- Tracking sync status
- Cleaning up old messages

### Utilities

#### messageSync
Sync utilities for:
- Syncing pending messages
- Retrying failed messages
- Cleaning up old messages

## Usage

### Navigation

```typescript
navigation.navigate('BookingChat', {
  bookingId: 'booking-123',
  providerName: 'John Doe',
  customerName: 'Jane Smith',
});
```

### Using the useChat Hook

```typescript
import { useChat } from '@/features/messaging';

const MyComponent = ({ bookingId }) => {
  const {
    messages,
    isLoading,
    sendMessage,
    markAsRead,
    isTyping,
    isConnected,
  } = useChat({ bookingId });

  const handleSend = async (content: string) => {
    await sendMessage(content);
  };

  return (
    // Your UI
  );
};
```

## WebSocket Events

### Emitted Events
- `message:send` - Send a new message
- `message:typing` - Indicate user is typing
- `message:read` - Mark messages as read

### Subscribed Events
- `message:received` - New message received
- `message:typing` - Other user typing status
- `message:read` - Messages marked as read by other user

## Data Flow

### Sending a Message

1. User types message and taps send
2. Generate temporary ID
3. Optimistically add to UI
4. Store in SQLite with 'pending' status
5. Send via WebSocket (or HTTP if disconnected)
6. Update with real ID when confirmed
7. Mark as 'synced' in database

### Receiving a Message

1. WebSocket event received
2. Add to React Query cache
3. Store in SQLite database
4. Update UI automatically
5. Auto-mark as read if screen is focused

### Offline Handling

1. Message stored with 'pending' status
2. Queued in local database
3. When connection restored:
   - Detect connection change
   - Fetch pending messages
   - Retry sending each message
   - Update status to 'synced' or 'failed'

## Testing

### Unit Tests
- Message formatting
- Sync logic
- Repository operations

### Integration Tests
- WebSocket message flow
- Offline message queuing
- Reconnection sync

### E2E Tests
- Complete chat conversation
- Offline message sending
- Read receipts

## Performance Considerations

- Messages are virtualized with FlatList
- Optimistic updates for instant feedback
- Local database for fast initial load
- Efficient WebSocket event handling
- Automatic cleanup of old messages

## Accessibility

- Screen reader support for all messages
- Proper accessibility labels
- Keyboard navigation support
- Connection status announcements
- Typing indicator announcements

## Future Enhancements

- [ ] Image/file attachments
- [ ] Message reactions
- [ ] Message editing/deletion
- [ ] Voice messages
- [ ] Push notifications for new messages
- [ ] Message search
- [ ] Conversation list screen
