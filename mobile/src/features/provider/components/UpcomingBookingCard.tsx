/**
 * Upcoming Booking Card Component
 * Displays a single upcoming booking in the dashboard
 *
 * Requirements: 8.4
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../../../shared/components/Card';
import { Text } from '../../../shared/components/Text';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { UpcomingBooking } from '../../../core/api/services/ProviderDashboardService';
import { formatCurrency, formatTime } from '../../../shared/utils/formatting';

export interface UpcomingBookingCardProps {
  /**
   * Booking data
   */
  booking: UpcomingBooking;

  /**
   * Press handler
   */
  onPress?: () => void;
}

export const UpcomingBookingCard: React.FC<UpcomingBookingCardProps> = ({
  booking,
  onPress,
}) => {
  const { theme } = useTheme();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card
      elevation="sm"
      padding="md"
      onPress={onPress}
      accessibilityLabel={`Booking with ${booking.customerName} on ${formatDate(booking.scheduledDate)}`}
    >
      <View style={styles.container}>
        {/* Customer info */}
        <View style={styles.header}>
          <View style={styles.customerInfo}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
              <Text variant="body" style={styles.avatarText}>
                {booking.customerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.customerDetails}>
              <Text variant="body" style={styles.customerName}>
                {booking.customerName}
              </Text>
              <Text variant="caption" color="textSecondary">
                {booking.serviceName}
              </Text>
            </View>
          </View>
          <View style={styles.amount}>
            <Text variant="h6" style={styles.amountText}>
              {formatCurrency(booking.totalAmount)}
            </Text>
          </View>
        </View>

        {/* Booking details */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text variant="caption" color="textSecondary">
              📅 {formatDate(booking.scheduledDate)}
            </Text>
            <Text variant="caption" color="textSecondary">
              🕐 {formatTime(booking.scheduledTime)}
            </Text>
            <Text variant="caption" color="textSecondary">
              ⏱️ {booking.duration} min
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Text variant="caption" color="textSecondary" numberOfLines={1}>
              📍 {booking.location.address}, {booking.location.city}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  amount: {
    marginLeft: spacing.md,
  },
  amountText: {
    fontWeight: '700',
  },
  details: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
  },
});
