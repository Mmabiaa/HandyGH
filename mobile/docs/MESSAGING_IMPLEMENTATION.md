# Messaging Feature Implementation

## Overview

This document describes the implementation of the real-time messaging feature for HandyGH bookings (Task 16).

## Requirements Implemented

### Task 16.1: Create BookingChatScreen ✅
- **Requirement 6.1**: WebSocket connection established for real-time messaging
- **Requirement 6.2**: Message history fetched from API on screen load
- **Requirement 6.3**: Messages displayed in chronological order with sender identification
- **Requirement 6.4**: Message input field with send button
- **Requirement 6.5**: Messages sent through WebSocket connection
- **Requirement 6.6**: Sent messages displayed with delivery indicator
- **Requirement 6.9**: Messages marked as read when screen is active

### Task 16.2: Implement Real-time Message Updates ✅
- **Requirement 6.7**: New messages received via WebSocket displayed with animation
- **Requirement 6.8**: Push notifications for new messages (when screen not active)
- **Requirement 6.7**: Typing indicators displayed when other user is typing
- **Requirement 6.8**: Message delivery status tracked and displayed

### Task 16.3: Add Message Persistence and Offline Support ✅
- **Requirement 14.9**: Messages stored in SQLite database
- **Requirement 14.10**: Message sync on reconnection
- **Requirement 14.10**: Offline message sending with queue

## Architecture

### Components

```
src/features/messaging/
├── components/
│   ├── MessageBubble.tsx       # Individual message display
│   ├── ChatInput.tsx           # Message composition
│   └── TypingIndicator.tsx     # Animated typing indicator
├── screens/
│   └── BookingChatScreen.tsx   # Main chat interface
├── hooks/
│   └── useChat.ts              # Chat functionality hook
├── utils/
│   └── messageSync.ts          # Message sync utilities
└── index.ts                    # Public exports
```

### Data Flow

#### Message Sending Flow
```
User Input → ChatInput
    ↓
sendMessage() in useChat
    ↓
1. Generate temp ID
2. Optimistic UI update (React Query)
3. Store in SQLite (pending status)
4. Send via WebSocket
    ↓
Server confirms
    ↓
Update with real ID
Mark as synced in SQLite
```

#### Message Receiving Flow
```
WebSocket Event (message:received)
    ↓
useChat subscription handler
    ↓
1. Add to React Query cache
2. Store in SQLite (synced status)
3. UI updates automatically
4. Auto-mark as read (if screen focused)
```

#### Offline Message Flow
```
User sends message (offline)
    ↓
1. Store in SQLite (pending status)
2. Show in UI with pending indicator
    ↓
Connection restored
    ↓
syncPendingMessages()
    ↓
1. Fetch pending messages from SQLite
2. Retry sending each message
3. Update status (synced/failed)
```

## Key Features

### Real-time Messaging
- WebSocket-based instant message delivery
- Automatic fallback to HTTP when WebSocket unavailable
- Optimistic UI updates for instant feedback
- Message delivery confirmation

### Typing Indicators
- Real-time typing status via WebSocket
- Animated dot indicator
- Auto-hide after 3 seconds of inactivity
- Throttled emission to reduce network traffic

### Read Receipts
- Double checkmark for read messages
- Single checkmark for delivered messages
- Automatic read marking when screen focused
- Batch read receipt updates

### Offline Support
- Messages stored in local SQLite database
- Offline message composition and queuing
- Automatic sync when connection restored
- Failed message retry mechanism
- Local-first data loading

### Connection Management
- Connection status indicator in header
- Automatic reconnection handling
- Pending message sync on reconnection
- Graceful degradation to HTTP

## Implementation Details

### useChat Hook

The `useChat` hook is the core of the messaging functionality:

```typescript
const {
  messages,           // Array of messages
  isLoading,          // Loading state
  isError,            // Error state
  error,              // Error object
  sendMessage,        // Send message function
  markAsRead,         // Mark messages as read
  isTyping,           // Other user typing status
  isConnected,        // WebSocket connection status
  sendTypingIndicator // Send typing indicator
} = useChat({ bookingId });
```

**Key Responsibilities:**
1. Fetch message history from API
2. Subscribe to WebSocket events
3. Handle message sending (WebSocket + HTTP fallback)
4. Manage optimistic updates
5. Store messages in SQLite
6. Sync pending messages on reconnection
7. Track typing indicators
8. Handle read receipts

### MessageRepository

SQLite repository for message persistence:

```typescript
interface Message {
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
```

**Key Methods:**
- `insert()` - Insert single message
- `insertBatch()` - Insert multiple messages
- `getByBookingId()` - Get all messages for a booking
- `markAsRead()` - Mark message as read
- `markAllAsReadForBooking()` - Mark all messages as read
- `updateSyncStatus()` - Update sync status
- `getUnsyncedMessages()` - Get pending/failed messages
- `deleteOldMessages()` - Cleanup old messages

### WebSocket Events

**Emitted Events:**
```typescript
// Send a message
socket.emit('message:send', {
  bookingId: string,
  content: string,
  type: 'text' | 'image',
  tempId: string
});

// Typing indicator
socket.emit('message:typing', {
  bookingId: string,
  isTyping: boolean
});

// Read receipt
socket.emit('message:read', {
  bookingId: string,
  messageIds: string[]
});
```

**Subscribed Events:**
```typescript
// New message received
socket.on('message:received', (message: Message) => {
  // Add to cache and database
});

// Typing status
socket.on('message:typing', (data: {
  bookingId: string,
  userId: string,
  isTyping: boolean
}) => {
  // Update typing indicator
});

// Read receipt
socket.on('message:read', (data: {
  bookingId: string,
  messageIds: string[]
}) => {
  // Update message read status
});
```

## UI Components

### BookingChatScreen

Main chat interface with:
- Header with connection status indicator
- Message list (FlatList with auto-scroll)
- Typing indicator
- Message input
- Empty/loading/error states

**Accessibility:**
- Screen reader support for all messages
- Connection status announcements
- Proper accessibility labels
- Keyboard navigation

### MessageBubble

Individual message display:
- Different styling for own vs other messages
- Sender name for other messages
- Timestamp
- Read receipts (✓ sent, ✓✓ read)
- System message support

### ChatInput

Message composition:
- Multi-line text input
- Send button (enabled when text present)
- Character limit (1000)
- Typing indicator emission
- Disabled state when offline

### TypingIndicator

Animated typing indicator:
- Three animated dots
- User name display
- Auto-hide after timeout

## Performance Optimizations

1. **Virtualized List**: FlatList for efficient rendering of large message lists
2. **Optimistic Updates**: Instant UI feedback before server confirmation
3. **Local-First Loading**: Load from SQLite first, then sync with API
4. **Efficient WebSocket**: Subscribe only to relevant events
5. **Batch Operations**: Batch read receipts and database operations
6. **Auto-Cleanup**: Periodic cleanup of old messages

## Error Handling

1. **Network Errors**: Automatic fallback to HTTP
2. **Send Failures**: Messages marked as failed, retry available
3. **Connection Loss**: Queue messages, sync on reconnection
4. **API Errors**: Display user-friendly error messages
5. **Database Errors**: Graceful degradation, log errors

## Testing Strategy

### Unit Tests
- Message formatting utilities
- Sync logic
- Repository operations
- Hook behavior

### Integration Tests
- WebSocket message flow
- Offline message queuing
- Reconnection sync
- Read receipt handling

### E2E Tests
- Complete chat conversation
- Offline message sending
- Typing indicators
- Read receipts

## Future Enhancements

1. **Rich Media**: Image/file attachments
2. **Message Actions**: Edit, delete, reply
3. **Reactions**: Emoji reactions to messages
4. **Voice Messages**: Audio recording and playback
5. **Message Search**: Search within conversation
6. **Conversation List**: List of all conversations
7. **Push Notifications**: Enhanced notification support
8. **Message Encryption**: End-to-end encryption

## Usage Example

### Navigation to Chat

```typescript
// From BookingDetailsScreen
navigation.navigate('BookingChat', {
  bookingId: booking.id,
  providerName: booking.provider?.businessName,
  customerName: `${booking.customer?.firstName} ${booking.customer?.lastName}`,
});
```

### Using the Hook

```typescript
import { useChat } from '@/features/messaging';

const ChatComponent = ({ bookingId }) => {
  const {
    messages,
    sendMessage,
    isTyping,
    isConnected,
  } = useChat({ bookingId });

  const handleSend = async (text: string) => {
    await sendMessage(text);
  };

  return (
    <View>
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isTyping && <TypingIndicator />}
      <ChatInput onSend={handleSend} disabled={!isConnected} />
    </View>
  );
};
```

## Dependencies

- `@tanstack/react-query` - Server state management
- `socket.io-client` - WebSocket client
- `react-native-sqlite-storage` - Local database
- `@expo/vector-icons` - Icons
- `zustand` - Global state (auth)

## Files Created

1. `mobile/src/core/api/services/MessageService.ts` - API service
2. `mobile/src/features/messaging/components/MessageBubble.tsx` - Message display
3. `mobile/src/features/messaging/components/ChatInput.tsx` - Input component
4. `mobile/src/features/messaging/components/TypingIndicator.tsx` - Typing indicator
5. `mobile/src/features/messaging/hooks/useChat.ts` - Main hook
6. `mobile/src/features/messaging/screens/BookingChatScreen.tsx` - Main screen
7. `mobile/src/features/messaging/utils/messageSync.ts` - Sync utilities
8. `mobile/src/features/messaging/index.ts` - Public exports
9. `mobile/src/features/messaging/README.md` - Feature documentation

## API Integration

The messaging feature integrates with the following backend endpoints:

- `GET /api/v1/bookings/{bookingId}/messages/` - Fetch message history
- `POST /api/v1/bookings/{bookingId}/messages/` - Send message (HTTP fallback)
- `POST /api/v1/bookings/{bookingId}/messages/mark-read/` - Mark messages as read
- `POST /api/v1/bookings/{bookingId}/messages/mark-all-read/` - Mark all as read

WebSocket events are handled through the existing SocketManager.

## Conclusion

The messaging feature provides a robust, real-time communication system with comprehensive offline support. It follows React Native best practices, implements proper error handling, and provides an excellent user experience with optimistic updates and smooth animations.
