# Real-time Communication Module

This module provides WebSocket functionality for real-time updates in the HandyGH mobile application.

## Architecture

The real-time module is built around the `SocketManager` class, which implements a singleton pattern to ensure a single WebSocket connection throughout the application lifecycle.

### Key Components

1. **SocketManager**: Core class managing WebSocket connections
2. **React Hooks**: Convenient hooks for using WebSocket in React components
3. **Event Types**: Strongly-typed event definitions

## Usage

### Initialization

Initialize the SocketManager in your app initialization:

```typescript
import SocketManager from '@/core/realtime';
import { SOCKET_CONFIG } from '@/core/realtime/config';

// Initialize socket manager
SocketManager.getInstance(SOCKET_CONFIG);
```

### Connecting to WebSocket

```typescript
import { useSocketConnection } from '@/core/realtime';

function MyComponent() {
  const { connect, disconnect, isConnected } = useSocketConnection();

  useEffect(() => {
    connect();
    return () => disconnect();
  }, []);

  return <Text>Connected: {isConnected ? 'Yes' : 'No'}</Text>;
}
```

### Subscribing to Events

```typescript
import { useSocketEvent, SocketEvent } from '@/core/realtime';

function BookingUpdates() {
  useSocketEvent(
    SocketEvent.BOOKING_STATUS_UPDATE,
    (data) => {
      console.log('Booking status updated:', data);
      // Handle booking update
    },
    []
  );

  return <View>...</View>;
}
```

### Emitting Events

```typescript
import { useSocketEmit, SocketEvent } from '@/core/realtime';

function ChatComponent() {
  const emit = useSocketEmit();

  const sendMessage = (message: string) => {
    emit(SocketEvent.MESSAGE_RECEIVED, {
      bookingId: '123',
      content: message,
    });
  };

  return <Button onPress={() => sendMessage('Hello')} />;
}
```

### Monitoring Connection Status

```typescript
import { useSocketStatus } from '@/core/realtime';

function ConnectionIndicator() {
  const { status, isConnected, isReconnecting } = useSocketStatus();

  if (isReconnecting) {
    return <Text>Reconnecting...</Text>;
  }

  return <Text>Status: {status}</Text>;
}
```

## Event Types

### Booking Events

- `BOOKING_REQUEST`: New booking request received (providers)
- `BOOKING_STATUS_UPDATE`: Booking status changed
- `BOOKING_CONFIRMED`: Booking confirmed by provider
- `BOOKING_CANCELLED`: Booking cancelled

### Message Events

- `MESSAGE_RECEIVED`: New message received
- `MESSAGE_READ`: Message read by recipient
- `MESSAGE_TYPING`: User is typing

### Provider Events

- `PROVIDER_ONLINE`: Provider came online
- `PROVIDER_OFFLINE`: Provider went offline
- `PROVIDER_LOCATION_UPDATE`: Provider location updated

## Connection Management

The SocketManager automatically handles:

- **Authentication**: Injects auth token on connection
- **Reconnection**: Automatic reconnection with exponential backoff
- **Event Resubscription**: Resubscribes to events after reconnection
- **Connection Status**: Tracks and broadcasts connection status changes

## Best Practices

1. **Connect Early**: Connect to WebSocket when user logs in
2. **Disconnect on Logout**: Always disconnect when user logs out
3. **Handle Reconnection**: Show UI feedback during reconnection
4. **Cleanup Subscriptions**: Use the returned unsubscribe function
5. **Error Handling**: Handle connection errors gracefully

## Testing

For testing, you can reset the singleton instance:

```typescript
import SocketManager from '@/core/realtime';

afterEach(() => {
  SocketManager.reset();
});
```

## Configuration

WebSocket configuration is in `config.ts`:

- `url`: WebSocket server URL
- `reconnectionAttempts`: Max reconnection attempts (default: 5)
- `reconnectionDelay`: Initial reconnection delay (default: 1000ms)
- `reconnectionDelayMax`: Max reconnection delay (default: 5000ms)
- `timeout`: Connection timeout (default: 20000ms)
