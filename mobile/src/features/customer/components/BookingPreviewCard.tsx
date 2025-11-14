/**
 * Booking Preview Card Component
 *
 * Displays a preview of an active booking with key information.
 * Used in the home screen active bookings section.
 *
 * Requirements: 5.12
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Text } from '../../../shared/components';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import { shadows } from '../../../core/theme/shadows';
import type { Booking, BookingStatus } from '../../../core/api/types';

interface BookingPreviewCardProps {
  booking: Booking;
  onPress: () => void;
}

/**
 * Get status display information
 */
const getStatusInfo = (status: BookingStatus): { label: string; color: string; emoji: string } => {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmed', color: '#4CAF50', emoji: '✓' };
    case 'on_the_way':
      return { label: 'On the way', color: '#2196F3', emoji: '🚗' };
    case 'arrived':
      return { label: 'Arrived', color: '#FF9800', emoji: '📍' };
    case 'in_progress':
      return { label: 'In Progress', color: '#9C27B0', emoji: '⚙️' };
    default:
      return { label: 'Pending', color: '#757575', emoji: '⏳' };
  }
};

/**
 * Format date and time for display
 */
const formatDateTime = (date: string, time: string): string => {
  try {
    const bookingDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if today
    if (bookingDate.toDateString() === today.toDateString()) {
      return `Today at ${time}`;
    }

    // Check if tomorrow
    if (bookingDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${time}`;
    }

    // Format as "Mon, Nov 15 at 10:00 AM"
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    const dateStr = bookingDate.toLocaleDateString('en-US', options);
    return `${dateStr} at ${time}`;
  } catch (error) {
    return `${date} at ${time}`;
  }
};

/**
 * Booking Preview Card Component
 */
export const BookingPreviewCard: React.FC<BookingPreviewCardProps> = ({
  booking,
  onPress,
}) => {
  const { theme } = useTheme();
  const statusInfo = getStatusInfo(booking.status);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.cardBackground,
          ...shadows.sm,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="View booking details"
      accessibilityHint={`View details for booking with ${booking.provider?.businessName || 'provider'}`}
    >
      <View style={styles.content}>
        {/* Provider Image */}
        <View style={styles.imageContainer}>
          {booking.provider?.profilePhoto ? (
            <Image
              source={{ uri: booking.provider.profilePhoto }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.neutral[200] }]}>
              <Text variant="h6" color="textSecondary">
                {booking.provider?.businessName?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </View>

        {/* Booking Info */}
        <View style={styles.infoContainer}>
          <Text variant="labelLarge" color="text" numberOfLines={1}>
            {booking.provider?.businessName || 'Provider'}
          </Text>

          <Text variant="bodySmall" color="textSecondary" numberOfLines={1} style={styles.service}>
            {booking.service?.name || 'Service'}
          </Text>

          <Text variant="caption" color="textSecondary" style={styles.dateTime}>
            📅 {formatDateTime(booking.scheduledDate, booking.scheduledTime)}
          </Text>

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text variant="caption" color="textOnPrimary" style={styles.statusText}>
              {statusInfo.emoji} {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Arrow Icon */}
        <View style={styles.arrowContainer}>
          <Text variant="h6" color="textSecondary">
            ›
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  service: {
    marginTop: spacing.xs,
  },
  dateTime: {
    marginTop: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  arrowContainer: {
    marginLeft: spacing.sm,
  },
});
