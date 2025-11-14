/**
 * Active Bookings Component
 *
 * Displays a preview of active bookings on the home screen.
 * Shows confirmed, on_the_way, arrived, and in_progress bookings.
 *
 * Requirements: 5.12
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text } from '../../../shared/components';
import { spacing } from '../../../core/theme/spacing';
import { BookingPreviewCard } from './BookingPreviewCard';
import type { Booking } from '../../../core/api/types';

interface ActiveBookingsProps {
  bookings: Booking[];
  onBookingPress: (bookingId: string) => void;
  onViewAll?: () => void;
}

/**
 * Active Bookings Section Component
 */
export const ActiveBookings: React.FC<ActiveBookingsProps> = ({
  bookings,
  onBookingPress,
  onViewAll,
}) => {
  if (bookings.length === 0) {
    return null;
  }

  // Show maximum of 3 bookings in preview
  const displayBookings = bookings.slice(0, 3);

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text variant="h6" color="text" accessibilityRole="header">
          Active Bookings
        </Text>
        {onViewAll && bookings.length > 3 && (
          <TouchableOpacity
            onPress={onViewAll}
            accessibilityRole="button"
            accessibilityLabel="View all bookings"
          >
            <Text variant="labelLarge" color="primary">
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bookings List */}
      <View style={styles.listContainer}>
        {displayBookings.map((booking) => (
          <BookingPreviewCard
            key={booking.id}
            booking={booking}
            onPress={() => onBookingPress(booking.id)}
          />
        ))}
      </View>

      {/* Show count if more bookings exist */}
      {bookings.length > 3 && (
        <Text variant="caption" color="textSecondary" align="center" style={styles.moreText}>
          +{bookings.length - 3} more active {bookings.length - 3 === 1 ? 'booking' : 'bookings'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
  },
  moreText: {
    marginTop: spacing.sm,
  },
});
