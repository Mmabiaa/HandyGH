/**
 * Review Card Component
 *
 * Displays a customer review with rating, comment, and customer info.
 * Used in provider detail and reviews screens.
 *
 * Requirements: 3.4, 3.5, 7.7, 7.8
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from '../../../shared/components';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import type { Review } from '../../../core/api/types';

interface ReviewCardProps {
  review: Review;
  showProviderResponse?: boolean;
}

/**
 * Review Card Component
 */
export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  showProviderResponse = true,
}) => {
  const { theme } = useTheme();

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Text key={index} variant="body" color={index < rating ? 'warning' : 'textSecondary'}>
        {index < rating ? '⭐' : '☆'}
      </Text>
    ));
  };

  const customerName = review.customer
    ? `${review.customer.firstName} ${review.customer.lastName}`
    : 'Anonymous';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.neutral[200] },
      ]}
    >
      {/* Customer Info */}
      <View style={styles.header}>
        <View style={styles.customerInfo}>
          {review.customer?.profilePhoto ? (
            <Image
              source={{ uri: review.customer.profilePhoto }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.neutral[300] }]}>
              <Text variant="caption" color="textSecondary">
                {customerName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.customerDetails}>
            <Text variant="labelLarge">{customerName}</Text>
            <Text variant="caption" color="textSecondary">
              {formatDate(review.createdAt)}
            </Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.ratingContainer}>{renderStars(review.rating)}</View>
      </View>

      {/* Review Comment */}
      <Text variant="body" color="text" style={styles.comment}>
        {review.comment}
      </Text>

      {/* Provider Response */}
      {showProviderResponse && review.response && (
        <View style={[styles.responseContainer, { backgroundColor: theme.colors.neutral[100] }]}>
          <Text variant="caption" color="primary" style={styles.responseLabel}>
            Provider Response:
          </Text>
          <Text variant="bodySmall" color="textSecondary">
            {review.response}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerDetails: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginLeft: spacing.sm,
  },
  comment: {
    lineHeight: 20,
  },
  responseContainer: {
    marginTop: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  responseLabel: {
    marginBottom: spacing.xs,
  },
});
