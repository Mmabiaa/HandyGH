# React Query Configuration

This directory contains the React Query setup for server state management with optimized caching strategies.

## Query Client (`queryClient.ts`)

Configured with:
- **Stale-while-revalidate** caching strategy
- 5-minute stale time (data is fresh for 5 minutes)
- 30-minute cache time
- Automatic retry with exponential backoff
- Refetch on window focus, reconnect, and mount

## Query Keys (`queryKeys.ts`)

Hierarchical query key factory for consistent cache management:

```typescript
// Providers
queryKeys.providers.all
queryKeys.providers.list(params)
queryKeys.providers.detail(id)
queryKeys.providers.services(id)
queryKeys.providers.reviews(id)

// Bookings
queryKeys.bookings.all
queryKeys.bookings.list(status)
queryKeys.bookings.detail(id)
queryKeys.bookings.availability(params)

// Categories
queryKeys.categories.list()
queryKeys.categories.detail(id)
```

## Custom Hooks

### Provider Hooks (`hooks/useProviders.ts`)

- `useProviders(params)` - Fetch providers list with filters
- `useProvider(id)` - Fetch single provider
- `useProviderServices(id)` - Fetch provider services
- `useProviderReviews(id, page)` - Fetch provider reviews with pagination
- `useFavoriteProvider()` - Favorite a provider (mutation)
- `useUnfavoriteProvider()` - Unfavorite a provider (mutation)
- `useSearchProviders(query)` - Search providers

### Booking Hooks (`hooks/useBookings.ts`)

- `useBookings(status)` - Fetch bookings list with optional status filter
- `useBooking(id)` - Fetch single booking
- `useAvailability(params)` - Check provider availability
- `useCreateBooking()` - Create new booking (mutation with optimistic updates)
- `useUpdateBookingStatus()` - Update booking status (mutation with optimistic updates and rollback)
- `useCancelBooking()` - Cancel a booking (mutation)
- `useActiveBookings()` - Fetch active bookings only

### Category Hooks (`hooks/useCategories.ts`)

- `useCategories()` - Fetch all service categories (cached for 1 hour)
- `useCategory(id)` - Fetch single category

## Features

### Optimistic Updates
Mutations update the cache immediately for better UX, with automatic rollback on error.

### Cache Invalidation
Related queries are automatically invalidated after mutations using `getRelatedQueryKeys`.

### Stale-While-Revalidate
Users see cached data immediately while fresh data is fetched in the background.

### Error Handling
Automatic retry with exponential backoff for failed requests.

## Usage Example

```typescript
import { useProviders, useCreateBooking } from '@core/query';

function HomeScreen() {
  // Fetch providers
  const { data: providers, isLoading, error } = useProviders({ category: 'plumbing' });
  
  // Create booking mutation
  const createBooking = useCreateBooking({
    onSuccess: (booking) => {
      navigation.navigate('BookingConfirmation', { bookingId: booking.id });
    },
  });
  
  const handleBooking = () => {
    createBooking.mutate({
      providerId: 'provider-1',
      serviceId: 'service-1',
      scheduledDate: '2024-11-15',
      scheduledTime: '10:00',
      location: { /* ... */ },
    });
  };
  
  return (
    // UI implementation
  );
}
```

## Testing

All hooks have comprehensive unit tests covering:
- Data fetching
- Mutations
- Optimistic updates
- Error handling
- Cache updates

Run tests:
```bash
npm test -- src/core/query/hooks/__tests__
```
