# Booking Feature

This feature implements the complete booking creation flow for customers to book services from providers.

## Overview

The booking flow consists of 4 main steps:
1. **Service Selection** - Choose a service and optional add-ons
2. **Date & Time Selection** - Pick a date and available time slot
3. **Location Selection** - Enter or select service location
4. **Booking Summary** - Review and confirm booking details

## Architecture

### State Machine

The booking flow is managed by a finite state machine (`useBookingFlow` hook) that:
- Maintains form state across all steps
- Validates each step before allowing navigation
- Provides progress tracking
- Enables forward/backward navigation with validation

### Components

- **ServiceSelectionScreen** - Service and add-on selection
- **DateTimeSelectionScreen** - Date and time slot picker
- **LocationSelectionScreen** - Location input with autocomplete
- **BookingSummaryScreen** - Final review and confirmation
- **BookingProgressIndicator** - Visual progress indicator

### State Management

The `BookingFlowContext` provides shared state across all booking screens:
- Current step tracking
- Form data persistence
- Navigation actions
- Validation state

## Usage

### Basic Implementation

```typescript
import { BookingFlowProvider, useBookingFlowContext } from '@/features/booking';

// Wrap your booking screens with the provider
function BookingNavigator() {
  return (
    <BookingFlowProvider providerId="provider-123">
      <Stack.Navigator>
        <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
        <Stack.Screen name="DateTimeSelection" component={DateTimeSelectionScreen} />
        <Stack.Screen name="LocationSelection" component={LocationSelectionScreen} />
        <Stack.Screen name="BookingSummary" component={BookingSummaryScreen} />
      </Stack.Navigator>
    </BookingFlowProvider>
  );
}
```

### Using the State Machine

```typescript
import { useBookingFlowContext } from '@/features/booking';

function MyBookingScreen() {
  const { state, actions } = useBookingFlowContext();

  // Access current state
  const { currentStep, serviceId, scheduledDate, isStepValid } = state;

  // Update state
  const handleServiceSelect = (serviceId: string) => {
    actions.setServiceSelection(serviceId);
  };

  // Navigate
  const handleNext = () => {
    if (actions.canGoNext()) {
      actions.goToNextStep();
    }
  };

  // Get progress
  const progress = actions.getProgress(); // Returns 0-100

  return (
    <View>
      <BookingProgressIndicator
        currentStep={state.currentStep}
        totalSteps={actions.getTotalSteps()}
        currentStepIndex={actions.getCurrentStepIndex()}
      />
      {/* Your screen content */}
    </View>
  );
}
```

### Step Validation

Each step is automatically validated before allowing navigation:

- **Service Selection**: Requires `serviceId`
- **Date & Time**: Requires `scheduledDate` and `scheduledTime`
- **Location**: Requires `location.address`, `location.city`, and `location.region`
- **Summary**: Requires all previous steps to be valid

### Navigation Flow

```typescript
// Forward navigation (with validation)
if (actions.canGoNext()) {
  actions.goToNextStep(); // Returns true if successful
}

// Backward navigation
if (actions.canGoBack()) {
  actions.goToPreviousStep(); // Returns true if successful
}

// Direct navigation to specific step
actions.goToStep(BookingFlowStep.LOCATION_SELECTION);

// Reset entire flow
actions.resetFlow();
```

### Progress Tracking

```typescript
const progress = actions.getProgress(); // 0-100
const currentIndex = actions.getCurrentStepIndex(); // 0-3
const totalSteps = actions.getTotalSteps(); // 4
```

## State Persistence

The booking flow state is maintained in memory throughout the booking process. For persistence across app restarts, you can:

1. Save state to AsyncStorage/MMKV when user exits
2. Restore state when user returns
3. Implement auto-save on each step completion

Example:

```typescript
import { MMKVStorage } from '@/core/storage';

// Save state
const saveBookingDraft = async (state: BookingFlowState) => {
  await MMKVStorage.setItem('booking_draft', JSON.stringify(state));
};

// Restore state
const restoreBookingDraft = async (): Promise<BookingFlowState | null> => {
  const draft = await MMKVStorage.getItem('booking_draft');
  return draft ? JSON.parse(draft) : null;
};
```

## Integration with Navigation

The booking screens integrate with React Navigation. Each screen receives route params and can navigate to the next screen:

```typescript
// From ServiceSelectionScreen
navigation.navigate('DateTimeSelection', {
  providerId,
  serviceId: selectedServiceId,
});

// From DateTimeSelectionScreen
navigation.navigate('LocationSelection', {
  providerId,
  serviceId,
  scheduledDate,
  scheduledTime,
});

// From LocationSelectionScreen
navigation.navigate('BookingSummary', {
  providerId,
  serviceId,
  scheduledDate,
  scheduledTime,
  locationId,
});
```

## Error Handling

The booking flow includes comprehensive error handling:

- Network errors during data fetching
- Validation errors for form inputs
- API errors during booking creation
- User-friendly error messages with retry options

## Testing

### Unit Tests

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useBookingFlow, BookingFlowStep } from './useBookingFlow';

describe('useBookingFlow', () => {
  it('should initialize with correct state', () => {
    const { result } = renderHook(() => useBookingFlow('provider-123'));
    
    expect(result.current[0].currentStep).toBe(BookingFlowStep.SERVICE_SELECTION);
    expect(result.current[0].providerId).toBe('provider-123');
  });

  it('should navigate to next step when valid', () => {
    const { result } = renderHook(() => useBookingFlow('provider-123'));
    
    act(() => {
      result.current[1].setServiceSelection('service-456');
    });
    
    act(() => {
      const success = result.current[1].goToNextStep();
      expect(success).toBe(true);
    });
    
    expect(result.current[0].currentStep).toBe(BookingFlowStep.DATE_TIME_SELECTION);
  });
});
```

### Integration Tests

```typescript
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BookingFlowProvider } from './context/BookingFlowContext';

describe('Booking Flow Integration', () => {
  it('should complete full booking flow', async () => {
    const { getByText, getByLabelText } = render(
      <BookingFlowProvider providerId="provider-123">
        <BookingNavigator />
      </BookingFlowProvider>
    );

    // Select service
    fireEvent.press(getByText('Plumbing Service'));
    fireEvent.press(getByText('Continue'));

    // Select date and time
    await waitFor(() => getByText('Select Date'));
    fireEvent.press(getByLabelText('Select date November 15'));
    fireEvent.press(getByText('10:00 AM'));
    fireEvent.press(getByText('Continue'));

    // Enter location
    fireEvent.changeText(getByLabelText('Street address input'), 'East Legon');
    fireEvent.changeText(getByLabelText('City input'), 'Accra');
    fireEvent.changeText(getByLabelText('Region input'), 'Greater Accra');
    fireEvent.press(getByText('Continue'));

    // Confirm booking
    await waitFor(() => getByText('Review Your Booking'));
    fireEvent.press(getByLabelText('Accept terms and conditions'));
    fireEvent.press(getByText('Confirm Booking'));

    // Verify success
    await waitFor(() => {
      expect(getByText('Booking Confirmed')).toBeTruthy();
    });
  });
});
```

## Requirements Coverage

This implementation satisfies the following requirements:

- **4.1**: Service list with pricing and duration ✓
- **4.2**: Service add-ons selection with real-time price calculation ✓
- **4.3**: Fetch provider availability from API ✓
- **4.4**: Display available dates in calendar ✓
- **4.5**: Show available time slots with conflict detection ✓
- **4.6**: Address input with autocomplete ✓
- **4.7**: Current location and saved locations access ✓
- **4.8**: Display booking details recap with cost breakdown ✓
- **4.13**: Finite state machine for booking flow with step navigation ✓

## Future Enhancements

- [ ] Add booking draft auto-save
- [ ] Implement booking modification flow
- [ ] Add multi-service booking support
- [ ] Implement recurring booking scheduling
- [ ] Add booking templates for frequent bookings
- [ ] Implement booking sharing functionality
