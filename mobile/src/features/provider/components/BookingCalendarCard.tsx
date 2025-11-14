/**
 * Booking Calendar Card Component
 *
 * Displays booking information in calendar view
 * Requirement 9.10
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '../../../shared/components/Text';
import { Card } from '../../../shared/components/Card';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { formatTime, formatCurrency } from '../../../shared/utils/formatting';
import type { Booking, BookingStatus } from '../../../core/api/types';

interface BookingCalendarCardProps {
  booking: Booking;
  onPress: () => void;
}

// Status colors
const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: '#FFA726',
  confirmed: '#42A5F5',
  on_the_way: '#AB47BC',
  arrived: '#7E57C2',
  in_progress: '#26A69A',
  completed: '#66BB6A',
  cancelled: '#EF5350',
};

// Status labels
const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  on_the_way: 'On the way',
  arrived: 'Arrived',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/**
 * Booking Calendar Card
 * Requirement 9.10: Display booking details on tap
 */
export const BookingCalendarCard: React.FC<BookingCalendarCardProps> = ({
  booking,
  onPress,
}) => {
  const { theme } = useTheme();

  const customerName = booking.customer
    ? `${booking.customer.firstName} ${booking.customer.lastName}`
    : 'Customer';

  const serviceName = booking.service?.name || 'Service';
  const statusColor = STATUS_COLORS[booking.status];
  const statusLabel = STATUS_LABELS[booking.status];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View booking with ${customerName}`}
    >
      <Card elevation="sm" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.timeContainer}>
            <Text variant="label" style={{ color: theme.colors.primary }}>
              {formatTime(booking.scheduledTime)}
            </Text>
            <Text variant="caption" color="textSecondary">
              {booking.duration} mins
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text
              variant="caption"
              style={[styles.statusText, { color: statusColor }]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text variant="h6" numberOfLines={1}>
            {serviceName}
          </Text>
          <Text variant="bodySmall" color="textSecondary" numberOfLines={1}>
            {customerName}
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
            {formatCurrency(booking.totalAmount)}
          </Text>
        </View>

        {booking.location && (
          <Text
            variant="caption"
            color="textSecondary"
            numberOfLines={1}
            style={styles.location}
          >
            📍 {booking.location.address}
          </Text>
        )}
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 11,
  },
  content: {
    marginBottom: spacing.xs,
  },
  location: {
    marginTop: spacing.xs,
  },
});
