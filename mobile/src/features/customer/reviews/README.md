# Review and Rating System

## Overview

The review and rating system allows customers to rate and review service providers after completing a booking. This helps build trust and enables customers to make informed decisions when selecting providers.

## Features

### ReviewSubmissionScreen
- **5-Star Rating Selector**: Interactive star rating with haptic feedback
- **Text Input**: Multi-line text input with character count (10-500 characters)
- **Real-time Validation**: Inline validation with helpful error messages
- **Review Guidelines**: Display best practices for writing reviews
- **Success Confirmation**: Alert dialog on successful submission

### ProviderReviewsScreen
- **Rating Summary**: Visual breakdown of rating distribution
- **Sort Options**: Sort by Most Recent, Highest Rating, or Lowest Rating
- **Infinite Scroll**: Automatic pagination as user scrolls
- **Loading States**: Skeleton loading and pagination indicators
- **Empty State**: Friendly message when no reviews exist

### ReviewCard Component
- **Customer Info**: Profile photo, name, and review date
- **Star Rating**: Visual 5-star rating display
- **Review Comment**: Full review text
- **Provider Response**: Optional response from provider (if available)
- **Relative Dates**: Human-readable date formatting (e.g., "2 days ago")

### RatingBreakdown Component
- **Overall Rating**: Large display of average rating
- **Star Distribution**: Visual bars showing 5-star to 1-star breakdown
- **Review Count**: Total number of reviews
- **Percentage Indicators**: Shows percentage for each rating level

## Usage

### Submitting a Review

```typescript
import { ReviewSubmissionScreen } from '@features/customer/screens';

// Navigate to review submission
navigation.navigate('ReviewSubmission', {
  bookingId: 'booking-123',
  providerName: 'John\'s Plumbing Services'
});
```

### Viewing Reviews

```typescript
import { ProviderReviewsScreen } from '@features/customer/screens';

// Navigate to provider reviews
navigation.navigate('ProviderReviews', {
  providerId: 'provider-123'
});
```

### Using Review Hooks

```typescript
import { 
  useProviderReviews, 
  useProviderRatingBreakdown,
  useSubmitReview 
} from '@core/query/hooks/useReviews';

// Fetch reviews with infinite scroll
const { 
  data, 
  fetchNextPage, 
  hasNextPage 
} = useProviderReviews(providerId, { sortBy: 'recent' });

// Fetch rating breakdown
const { data: breakdown } = useProviderRatingBreakdown(providerId);

// Submit a review
const submitReview = useSubmitReview();
submitReview.mutate({
  bookingId: 'booking-123',
  rating: 5,
  comment: 'Excellent service!'
});
```

## API Integration

### Endpoints

- `POST /api/v1/bookings/{bookingId}/review/` - Submit review
- `GET /api/v1/reviews/?provider_id={id}` - Get provider reviews
- `GET /api/v1/reviews/breakdown/?provider_id={id}` - Get rating breakdown
- `GET /api/v1/reviews/my-reviews/` - Get user's reviews

### Data Models

```typescript
interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number; // 1-5
  comment: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
}

interface RatingBreakdown {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}
```

## Validation Rules

- **Rating**: Required, must be 1-5 stars
- **Comment**: 
  - Minimum: 10 characters
  - Maximum: 500 characters
  - Required

## Accessibility

- All interactive elements have accessibility labels
- Star buttons announce rating level to screen readers
- Form inputs have proper labels and hints
- Success/error messages are announced
- Touch targets meet 44x44 point minimum

## Performance

- Reviews cached for 5 minutes
- Infinite scroll pagination for efficient loading
- Optimistic updates for better UX
- Image lazy loading for customer photos

## Requirements Covered

- ✅ 7.1: Display 5-star rating selector
- ✅ 7.2: Provide haptic feedback on rating selection
- ✅ 7.3: Display validation message for minimum length
- ✅ 7.4: Enable submit button when validation requirements met
- ✅ 7.5: Send POST request with rating and review data
- ✅ 7.6: Display success confirmation
- ✅ 7.7: Display all reviews with pagination
- ✅ 7.8: Display rating summary with distribution
- ✅ 7.9: Implement review sorting

## Testing

Run tests with:
```bash
npm test -- reviews
```

## Future Enhancements

- Photo uploads with reviews
- Helpful vote system
- Review editing (within 24 hours)
- Review reporting
- AI-powered review highlights
