/**
 * Review Submission Screen
 *
 * Allows customers to rate and review service providers after service completion.
 * Features 5-star rating selector with haptic feedback and text input validation.
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Text, Button, TextInput } from '../../../shared/components';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import { useSubmitReview } from '../../../core/query/hooks/useReviews';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type ReviewSubmissionScreenProps = NativeStackScreenProps<any, 'ReviewSubmission'>;

const MIN_REVIEW_LENGTH = 10;
const MAX_REVIEW_LENGTH = 500;

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Review Submission Screen Component
 */
export const ReviewSubmissionScreen: React.FC<ReviewSubmissionScreenProps> = ({
  navigation,
  route,
}) => {
  const { bookingId, providerName } = route.params as {
    bookingId: string;
    providerName?: string;
  };
  const { theme } = useTheme();

  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Use mutation hook for submitting review
  const submitReviewMutation = useSubmitReview();

  /**
   * Handle star rating selection with haptic feedback
   * Requirement 7.2: Provide haptic feedback on rating selection
   */
  const handleRatingPress = (selectedRating: number) => {
    // Trigger haptic feedback
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    }

    setRating(selectedRating);
    setError('');
  };

  /**
   * Validate review text
   * Requirement 7.3: Display validation message for minimum length
   */
  const validateReview = (): boolean => {
    if (rating === 0) {
      setError('Please select a rating');
      return false;
    }

    if (reviewText.trim().length < MIN_REVIEW_LENGTH) {
      setError(`Review must be at least ${MIN_REVIEW_LENGTH} characters`);
      return false;
    }

    if (reviewText.trim().length > MAX_REVIEW_LENGTH) {
      setError(`Review must not exceed ${MAX_REVIEW_LENGTH} characters`);
      return false;
    }

    return true;
  };

  /**
   * Submit review to API
   * Requirement 7.5: Send POST request with rating and review data
   */
  const handleSubmit = async () => {
    if (!validateReview()) {
      return;
    }

    setError('');

    submitReviewMutation.mutate(
      {
        bookingId,
        rating,
        comment: reviewText.trim(),
      },
      {
        onSuccess: () => {
          // Requirement 7.6: Display success confirmation
          Alert.alert(
            'Review Submitted',
            'Thank you for your feedback! Your review helps other customers make informed decisions.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate back to booking details
                  navigation.goBack();
                },
              },
            ]
          );
        },
        onError: (err: any) => {
          console.error('Failed to submit review:', err);
          setError(
            err.response?.data?.message ||
              'Failed to submit review. Please try again.'
          );
        },
      }
    );
  };

  /**
   * Render star rating selector
   * Requirement 7.1: Display 5-star rating selector
   */
  const renderStarRating = () => {
    return (
      <View style={styles.ratingContainer}>
        <Text variant="h6" color="text" style={styles.ratingLabel}>
          How would you rate this service?
        </Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => handleRatingPress(star)}
              style={styles.starButton}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
              accessibilityState={{ selected: rating >= star }}
            >
              <Text
                variant="h2"
                color={rating >= star ? 'warning' : 'textSecondary'}
                style={styles.starIcon}
              >
                {rating >= star ? '⭐' : '☆'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {rating > 0 && (
          <Text variant="body" color="textSecondary" style={styles.ratingText}>
            {getRatingDescription(rating)}
          </Text>
        )}
      </View>
    );
  };

  /**
   * Get descriptive text for rating
   */
  const getRatingDescription = (stars: number): string => {
    switch (stars) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h4" color="text">
            Write a Review
          </Text>
          {providerName && (
            <Text variant="body" color="textSecondary" style={styles.providerName}>
              for {providerName}
            </Text>
          )}
        </View>

        {/* Star Rating Selector */}
        {renderStarRating()}

        {/* Review Text Input */}
        <View style={styles.reviewInputContainer}>
          <TextInput
            label="Your Review"
            value={reviewText}
            onChangeText={(text) => {
              setReviewText(text);
              setError('');
            }}
            placeholder="Share your experience with this service provider..."
            multiline
            numberOfLines={6}
            maxLength={MAX_REVIEW_LENGTH}
            style={styles.reviewInput}
            accessibilityLabel="Review text input"
            accessibilityHint="Enter your review comment"
          />

          <View style={styles.characterCount}>
            <Text
              variant="caption"
              color={reviewText.length < MIN_REVIEW_LENGTH ? 'error' : 'textSecondary'}
            >
              {reviewText.length}/{MAX_REVIEW_LENGTH} characters
              {reviewText.length < MIN_REVIEW_LENGTH &&
                ` (minimum ${MIN_REVIEW_LENGTH})`}
            </Text>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View
            style={[styles.errorContainer, { backgroundColor: theme.colors.error + '20' }]}
          >
            <Text variant="bodySmall" color="error">
              {error}
            </Text>
          </View>
        )}

        {/* Guidelines */}
        <View
          style={[
            styles.guidelinesContainer,
            { backgroundColor: theme.colors.neutral[100] },
          ]}
        >
          <Text variant="labelLarge" color="text" style={styles.guidelinesTitle}>
            Review Guidelines
          </Text>
          <Text variant="bodySmall" color="textSecondary" style={styles.guidelineItem}>
            • Be honest and specific about your experience
          </Text>
          <Text variant="bodySmall" color="textSecondary" style={styles.guidelineItem}>
            • Focus on the service quality and professionalism
          </Text>
          <Text variant="bodySmall" color="textSecondary" style={styles.guidelineItem}>
            • Keep your review respectful and constructive
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.colors.background,
            borderTopColor: theme.colors.neutral[200],
          },
        ]}
      >
        <Button
          variant="primary"
          size="large"
          fullWidth
          loading={submitReviewMutation.isPending}
          disabled={rating === 0 || reviewText.trim().length < MIN_REVIEW_LENGTH}
          onPress={handleSubmit}
          accessibilityLabel="Submit review"
        >
          Submit Review
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  providerName: {
    marginTop: spacing.xs,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  ratingLabel: {
    marginBottom: spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  starButton: {
    padding: spacing.xs,
    marginHorizontal: spacing.xs,
  },
  starIcon: {
    fontSize: 48,
  },
  ratingText: {
    marginTop: spacing.sm,
  },
  reviewInputContainer: {
    marginBottom: spacing.lg,
  },
  reviewInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
  },
  errorContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  guidelinesContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  guidelinesTitle: {
    marginBottom: spacing.sm,
  },
  guidelineItem: {
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
});
