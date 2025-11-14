# Review and Rating System Implementation

## Overview

This document describes the implementation of the review and rating system for the HandyGH Mobile Application. The system allows customers to rate and review service providers after service completion, helping other customers make informed decisions.

## Requirements Covered

- **Requirement 7.1**: Display 5-star rating selector
- **Requirement 7.2**: Provide haptic feedback on rating selection
- **Requirement 7.3**: Display validation message for minimum length
- **Requirement 7.4**: Enable submit button when validation requirements are met
- **Requirement 7.5**: Send POST request with rating and review data
- **Requirement 7.6**: Display success confirmation
- **Requirement 7.7**: Display all reviews with pagination
- **Requirement 7.8**: Display rating summary with distribution
- **Requirement 7.9**: Implement review sorting

## Architecture

### Components

#### 1. ReviewSubmissionScreen
**Location**: `src/features/customer/screens/ReviewSubmissionScreen.tsx`

**Purpose**: Allows customers to submit reviews for completed bookings.

**Features**:
- 5-star rating selector with haptic feedback
- Text input with character count and validation
- Real-time validation feedback
- Success confirmation dialog
- Review guidelines display

**Props**:
```typescript
{
  bookingId: string;
  providerName?: string;
}
```

**Validation Rules**:
- Minimum review length: 10 characters
- Maximum review length: 500 characters
- Rating must be selected (1-5 stars)

#### 2. ReviewCard
**Location**: `src/features/customer/components/ReviewCard.tsx`

**Purpose**: Displays individual review with customer info, rating, and comment.

**Features**:
- Customer profile photo or placeholder
- Star rating display
- Relative date formatting
- Optional provider response display

#### 3. RatingBreakdown
**Location**: `src/features/customer/components/RatingBreakdown.tsx`

**Purpose**: Visualizes rating distribution with bars and percentages.

**Features**:
- Overall average rating display
- 5-star to 1-star distribution bars
- Total review count
- Visual percentage indicators

#### 4. ProviderReviewsScreen
**Location**: `src/features/customer/screens/ProviderReviewsScreen.tsx`

**Purpose**: Displays full list of provider reviews with sorting and pagination.

**Features**:
- Rating summary at top
- Sort options (Most Recent, Highest Rating, Lowest Rating)
- Infinite scroll pagination
- Loading states
- Empty state handling

### API Service

#### ReviewService
**Location**: `src/core/api/services/ReviewService.ts`

**Methods**:

```typescript
// Submit a review for a booking
static async submitReview(
  bookingId: string,
  rating: number,
  comment: string
): Promise<Review>

// Get reviews for a provider with pagination
static async getProviderReviews(
  providerId: string,
  params?: ReviewQueryParams
): Promise<PaginatedResponse<Review>>

// Get rating breakdown for a provider
static async getProviderRatingBreakdown(
  providerId: string
): Promise<RatingBreakdown>

// Get reviews written by current user
static async getMyReviews(
  page: number,
  pageSize: number
): Promise<PaginatedResponse<Review>>

// Update an existing review
static async updateReview(
  reviewId: string,
  rating: number,
  comment: string
): Promise<Review>

// Delete a review
static async deleteReview(reviewId: string): Promise<void>
```

### React Query Hooks

**Location**: `src/core/query/hooks/useReviews.ts`

**Hooks**:

```typescript
// Fetch provider reviews with infinite scroll
useProviderReviews(providerId, params)

// Fetch provider rating breakdown
useProviderRatingBreakdown(providerId)

// Fetch specific review by ID
useReview(reviewId)

// Fetch current user's reviews
useMyReviews(page, pageSize)

// Submit a new review (mutation)
useSubmitReview()

// Update existing review (mutation)
useUpdateReview()

// Delete review (mutation)
useDeleteReview()
```

## Data Flow

### Submitting a Review

1. User navigates to ReviewSubmissionScreen from BookingDetailsScreen
2. User selects star rating (triggers haptic feedback)
3. User enters review text
4. Real-time validation checks:
   - Rating selected
   - Minimum character count met
5. User taps "Submit Review"
6. `useSubmitReview` mutation sends data to API
7. On success:
   - Success alert displayed
   - Provider reviews cache invalidated
   - Booking details cache invalidated
   - User navigated back to previous screen
8. On error:
   - Error message displayed
   - User can retry

### Viewing Reviews

1. User navigates to ProviderReviewsScreen from ProviderDetailScreen
2. `useProviderReviews` fetches first page of reviews
3. `useProviderRatingBreakdown` fetches rating summary
4. Reviews displayed with sort options
5. User scrolls to bottom
6. `fetchNextPage` loads more reviews
7. User can change sort order (triggers refetch)

## State Management

### Query Keys

```typescript
reviews: {
  all: ['reviews'],
  lists: () => ['reviews', 'list'],
  list: (providerId, params) => ['reviews', 'list', providerId, params],
  details: () => ['reviews', 'detail'],
  detail: (id) => ['reviews', 'detail', id],
  breakdown: (providerId) => ['reviews', 'breakdown', providerId],
  myReviews: (page, pageSize) => ['reviews', 'my-reviews', { page, pageSize }],
}
```

### Cache Invalidation

After submitting a review:
- Provider reviews list
- Provider rating breakdown
- Booking details (to show review)
- User's reviews list

## User Experience

### Haptic Feedback

Haptic feedback is triggered when:
- User selects a star rating (medium impact)
- User taps sort buttons (light impact)
- User taps submit button (light impact via Button component)

### Validation Feedback

- Character count displayed in real-time
- Minimum character requirement shown when below threshold
- Error messages displayed inline
- Submit button disabled until validation passes

### Loading States

- Skeleton loading for initial review fetch
- Loading indicator for pagination
- Loading spinner on submit button
- Full-screen loading for rating breakdown

### Empty States

- "No reviews yet" message when provider has no reviews
- "Be the first to review" call-to-action

## Accessibility

### Screen Reader Support

- All interactive elements have accessibility labels
- Star buttons announce rating level
- Form inputs have proper labels and hints
- Success/error messages are announced

### Touch Targets

- Star buttons: 48x48 points minimum
- Sort buttons: 44x44 points minimum
- Submit button: 44 points height

### Color Contrast

- Text meets WCAG 4.5:1 contrast ratio
- Star icons use warning color (high contrast)
- Error messages use error color

## Testing

### Unit Tests

Test coverage for:
- Review validation logic
- Rating calculation
- Date formatting
- Character count validation

### Integration Tests

Test scenarios:
- Submit review flow end-to-end
- Review list pagination
- Sort functionality
- Error handling

### Component Tests

Test components:
- ReviewCard renders correctly
- RatingBreakdown displays distribution
- ReviewSubmissionScreen validation
- Star rating interaction

## API Endpoints

### Submit Review
```
POST /api/v1/bookings/{bookingId}/review/
Body: { rating: number, comment: string }
Response: Review
```

### Get Provider Reviews
```
GET /api/v1/reviews/?provider_id={providerId}&page={page}&sort_by={sortBy}
Response: PaginatedResponse<Review>
```

### Get Rating Breakdown
```
GET /api/v1/reviews/breakdown/?provider_id={providerId}
Response: RatingBreakdown
```

### Get My Reviews
```
GET /api/v1/reviews/my-reviews/?page={page}
Response: PaginatedResponse<Review>
```

## Future Enhancements

1. **Review Photos**: Allow customers to upload photos with reviews
2. **Helpful Votes**: Let users mark reviews as helpful
3. **Review Responses**: Allow providers to respond to reviews
4. **Review Editing**: Allow customers to edit their reviews within 24 hours
5. **Review Reporting**: Allow users to report inappropriate reviews
6. **Review Filters**: Filter by rating, date range, or verified bookings
7. **Review Highlights**: Show common themes from reviews using AI
8. **Review Reminders**: Send push notifications to remind customers to review

## Performance Considerations

- Reviews cached for 5 minutes (stale time)
- Infinite scroll for efficient pagination
- Optimistic updates for better UX
- Image lazy loading for customer photos
- Debounced search/filter operations

## Security Considerations

- Reviews can only be submitted for completed bookings
- Users can only review bookings they were part of
- Input sanitization on both client and server
- Rate limiting on review submission
- Spam detection for review content
