# Real-time Updates and Push Notifications Implementation

This document describes the implementation of real-time booking updates and push notifications for the HandyGH mobile application.

## Overview

The implementation consists of three main components:

1. **WebSocket Connection Manager** - Real-time bidirectional communication
2. **Booking Status Updates** - Real-time booking state synchronization
3. **Push Notifications** - Native push notification support

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile Application                        │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  SocketManager │  │ NotificationMgr │  │ React Query  │ │
│  │   (WebSocket)  │  │  (Push Notif)   │  │   (Cache)    │ │
│  └────────┬───────┘  └────────┬───────┘  └──────┬───────┘ │
│           │                   │                   │          │
│           └───────────────────┴───────────────────┘          │
│                              │                                │
└──────────────────────────────┼────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
            ┌───────▼────────┐   ┌───────▼────────┐
            │  Backend API   │   │  Expo Push     │
            │  (WebSocket)   │   │  Service       │
            └────────────────┘   └────────────────┘
```

## 1. WebSocket Connection Manager

### Implementation

**Location**: `mobile/src/core/realtime/SocketManager.ts`

The `SocketManager` class provides:
- Singleton pattern for single connection instance
- Automatic authentication with JWT tokens
- Reconnection logic with exponential backoff
- Event subscription/emission
- Connection status tracking

### Key Features

```typescript
// Initialize socket manager
SocketManager.getInstance(SOCKET_CONFIG);

// Connect to WebSocket
await socketManager.connect();

// Subscribe to events
const unsubscribe = socketManager.subscribe(
  SocketEvent.BOOKING_STATUS_UPDATE,
  (data) => {
    console.log('Booking updated:', data);
  }
);

// Emit events
socketManager.emit(SocketEvent.MESSAGE_RECEIVED, {
  bookingId: '123',
  content: 'Hello',
});

// Check connection status
const isConnected = socketManager.isConnected();
```

### Event Types

```typescript
enum SocketEvent {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  
  // Booking events
  BOOKING_REQUEST = 'booking:request',
  BOOKING_STATUS_UPDATE = 'booking:status_update',
  BOOKING_CONFIRMED = 'booking:confirmed',
  BOOKING_CANCELLED = 'booking:cancelled',
  
  // Message events
  MESSAGE_RECEIVED = 'message:received',
  MESSAGE_READ = 'message:read',
  MESSAGE_TYPING = 'message:typing',
  
  // Provider events
  PROVIDER_ONLINE = 'provider:online',
  PROVIDER_OFFLINE = 'provider:offline',
  PROVIDER_LOCATION_UPDATE = 'provider:location_update',
}
```

### React Hooks

**Location**: `mobile/src/core/realtime/hooks/useSocket.ts`

```typescript
// Monitor connection status
const { isConnected, status } = useSocketStatus();

// Subscribe to events
useSocketEvent(SocketEvent.BOOKING_STATUS_UPDATE, (data) => {
  console.log('Booking updated:', data);
});

// Emit events
const emit = useSocketEmit();
emit(SocketEvent.MESSAGE_RECEIVED, { message: 'Hello' });

// Manage connection lifecycle
const { connect, disconnect } = useSocketConnection();
```

## 2. Booking Status Updates

### Implementation

**Location**: `mobile/src/core/realtime/hooks/useBookingUpdates.ts`

Provides hooks for real-time booking updates that automatically sync with React Query cache.

### Features

```typescript
// Subscribe to all booking updates for a specific booking
useAllBookingUpdates(bookingId);

// Subscribe to specific event types
useBookingStatusUpdates(bookingId);
useBookingConfirmation(bookingId);
useBookingCancellation(bookingId);

// For providers: subscribe to new booking requests
useBookingRequests();
```

### Integration

The hooks are integrated into key screens:

**BookingDetailsScreen**:
```typescript
const BookingDetailsScreen = () => {
  const { bookingId } = route.params;
  const { data: booking } = useBooking(bookingId);
  
  // Subscribe to real-time updates
  useAllBookingUpdates(bookingId);
  
  // Booking will automatically update when status changes
  return <View>...</View>;
};
```

**BookingListScreen**:
```typescript
const BookingListScreen = () => {
  const { data: bookings } = useBookings();
  
  // Subscribe to all booking updates
  useAllBookingUpdates();
  
  // List will automatically update when any booking changes
  return <FlatList data={bookings} />;
};
```

**HomeScreen**:
```typescript
const HomeScreen = () => {
  const { data: activeBookings } = useActiveBookings();
  
  // Subscribe to booking updates
  useAllBookingUpdates();
  
  // Active bookings will update in real-time
  return <View>...</View>;
};
```

### Cache Update Strategy

When a booking status update is received:

1. **Optimistic Update**: Immediately update the booking in React Query cache
2. **Invalidate Queries**: Trigger refetch to ensure data consistency
3. **Update All Lists**: Update booking in all list queries

```typescript
// Update specific booking
queryClient.setQueryData(
  queryKeys.bookings.detail(bookingId),
  (oldBooking) => ({
    ...oldBooking,
    status: newStatus,
    updatedAt: timestamp,
  })
);

// Update in all list queries
queryClient.setQueriesData(
  { queryKey: queryKeys.bookings.all },
  (oldBookings) =>
    oldBookings.map((booking) =>
      booking.id === bookingId
        ? { ...booking, status: newStatus }
        : booking
    )
);

// Invalidate to refetch
queryClient.invalidateQueries({
  queryKey: queryKeys.bookings.detail(bookingId),
});
```

## 3. Push Notifications

### Implementation

**Location**: `mobile/src/core/notifications/NotificationManager.ts`

The `NotificationManager` class provides:
- Push notification registration
- Permission management
- Local notification scheduling
- Badge count management
- Notification tap handling

### Setup

Notifications are automatically initialized in `AppInitializer`:

```typescript
await NotificationManager.getInstance().initialize();
```

### Configuration

**app.json**:
```json
{
  "notification": {
    "icon": "./assets/notification-icon.png",
    "color": "#000000"
  },
  "plugins": [
    ["expo-notifications", { ... }]
  ]
}
```

### React Hooks

**Location**: `mobile/src/core/notifications/hooks/useNotifications.ts`

```typescript
// Initialize notifications and get push token
const { pushToken, isInitialized } = useNotificationSetup();

// Handle notification navigation
useNotificationNavigation();

// Check and request permissions
const { isEnabled, requestPermissions } = useNotificationPermissions();

// Manage badge count
const { count, setBadgeCount, clearBadge } = useBadgeCount();

// Schedule local notifications
const { scheduleNotification } = useLocalNotification();
await scheduleNotification(
  'Reminder',
  'Your booking is tomorrow',
  { type: 'booking_reminder', bookingId: '123' },
  { seconds: 60 * 60 * 24 } // 24 hours
);
```

### Notification Types

The app handles different notification types for navigation:

- `booking_update`: Navigate to BookingDetailsScreen
- `new_message`: Navigate to BookingChatScreen
- `booking_request`: Navigate to BookingRequestsScreen (providers)
- `provider_update`: Navigate to ProviderDetailScreen

### Notification Preferences

**Location**: `mobile/src/core/notifications/components/NotificationPreferences.tsx`

Users can control notification preferences:

```typescript
<NotificationPreferences />
```

Preferences include:
- Enable/disable all notifications
- Booking updates
- Messages
- Promotions

Preferences are persisted in `appSettingsStore` using MMKV.

## Backend Integration

### WebSocket Events

The backend should emit these events:

```python
# Booking status update
socket.emit('booking:status_update', {
    'bookingId': booking.id,
    'status': booking.status,
    'updatedAt': booking.updated_at.isoformat(),
    'message': 'Booking status updated'
})

# New booking request (to provider)
socket.emit('booking:request', {
    'booking': booking_serializer.data,
    'message': 'New booking request received'
})

# Booking confirmed
socket.emit('booking:confirmed', {
    'bookingId': booking.id,
    'status': 'confirmed',
    'updatedAt': booking.updated_at.isoformat()
})
```

### Push Notifications

The backend should use Expo Push API:

```python
from exponent_server_sdk import PushClient, PushMessage

def send_push_notification(push_token, title, body, data):
    try:
        response = PushClient().publish(
            PushMessage(
                to=push_token,
                title=title,
                body=body,
                data=data,
                sound='default',
                badge=1
            )
        )
        return response
    except Exception as e:
        print(f'Error sending push notification: {e}')
```

### API Endpoints

**Update Push Token**:
```
POST /api/v1/users/push-token/
{
  "push_token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**WebSocket Authentication**:
```javascript
// Client sends token on connection
socket.auth = { token: 'JWT_TOKEN' };

// Server validates token
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Validate JWT token
  if (isValid(token)) {
    socket.userId = getUserIdFromToken(token);
    next();
  } else {
    next(new Error('Authentication error'));
  }
});
```

## Testing

### WebSocket Testing

```typescript
// Test connection
const socketManager = SocketManager.getInstance(SOCKET_CONFIG);
await socketManager.connect();
console.log('Connected:', socketManager.isConnected());

// Test event subscription
socketManager.subscribe(SocketEvent.BOOKING_STATUS_UPDATE, (data) => {
  console.log('Received update:', data);
});

// Test event emission
socketManager.emit(SocketEvent.MESSAGE_RECEIVED, {
  bookingId: '123',
  content: 'Test message',
});
```

### Notification Testing

```typescript
// Test local notification
const { scheduleNotification } = useLocalNotification();
await scheduleNotification(
  'Test Notification',
  'This is a test',
  { type: 'test' },
  { seconds: 5 }
);

// Test push token
const { pushToken } = useNotificationSetup();
console.log('Push token:', pushToken);

// Test permissions
const { isEnabled, requestPermissions } = useNotificationPermissions();
if (!isEnabled) {
  await requestPermissions();
}
```

## Troubleshooting

### WebSocket Issues

**Connection fails**:
- Check WebSocket URL in `config.ts`
- Verify authentication token is valid
- Check network connectivity
- Review server logs

**Events not received**:
- Verify event subscription
- Check event name matches server
- Ensure connection is established
- Review server event emission

### Notification Issues

**Push notifications not received**:
- Verify running on physical device
- Check notification permissions
- Verify push token is sent to backend
- Check Expo push service status

**Local notifications not appearing**:
- Check notification permissions
- Verify notification handler is set
- Check device notification settings

## Performance Considerations

### WebSocket

- Single connection instance (singleton pattern)
- Automatic reconnection with exponential backoff
- Event handler cleanup on unmount
- Efficient event subscription management

### Notifications

- Batch notification updates
- Debounce badge count updates
- Lazy initialization
- Cleanup listeners on unmount

## Security

### WebSocket

- JWT authentication on connection
- Token refresh on reconnection
- Secure WebSocket (wss://) in production
- Input validation on all events

### Notifications

- Secure token storage
- Permission validation
- Data sanitization in notification payloads
- Deep link validation

## Future Enhancements

1. **Typing Indicators**: Show when provider/customer is typing
2. **Read Receipts**: Track message read status
3. **Location Tracking**: Real-time provider location updates
4. **Rich Notifications**: Images and actions in notifications
5. **Notification Grouping**: Group related notifications
6. **Silent Notifications**: Background data sync
7. **Notification Analytics**: Track notification engagement

## References

- [Socket.IO Client Documentation](https://socket.io/docs/v4/client-api/)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Expo Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
