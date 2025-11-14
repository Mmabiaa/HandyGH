/**
 * Booking Request Card Component
 *
 * Displays a booking request with customer and service information
 * Requirements: 8.5, 8.6
 */

import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text } from '../../../shared/components/Text';
import { Card } from '../../../shared/components/Card';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { formatCurrency, formatDate, formatTime } from '../../../shared/utils/formatting';
import type { Booking } from '../../../core/api/types';

interface BookingRequestCardProps {
  booking: Booking;
  onPress: () => void;
}

/**
 * Booking Request Card
 * Requirements: 8.5, 8.6 - Display booking request with customer and service info
 */
export const BookingRequestCard: React.FC<BookingRequestCardProps> = ({
  booking,
  onPress,
}) => {
  const { theme } = useTheme();

  const customerName = booking.customer
    ? `${booking.customer.firstName} ${booking.customer.lastName}`
    : 'Customer';

  const serviceName = booking.service?.name || 'Service';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View booking request from ${customerName}`}
      accessibilityHint="Tap to view details and accept or decline"
    >
      <Card elevation="md" style={styles.card}>
        {/* Customer Info */}
        <View style={styles.header}>
          <View style={styles.customerInfo}>
            {booking.customer?.profilePhoto ? (
              <Image
                source={{ uri: booking.customer.profilePhoto }}
                style={styles.avatar}
                accessibilityLabel={`${customerName} profile photo`}
              />
            ) : (
              <View
                style={[
                  styles.avatar,
                  styles.avatarPlaceholder,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Text variant="h6" color="textSecondary">
                  {customerName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.customerDetails}>
              <Text variant="h6" numberOfLines={1}>
                {customerName}
              </Text>
              <Text variant="caption" color="textSecondary">
                New booking request
              </Text>
            </View>
          </View>
          <View style={[styles.badge, { backgroundColor: theme.colors.warning + '20' }]}>
            <Text
              variant="caption"
              style={[styles.badgeText, { color: theme.colors.warning }]}
            >
              Pending
            </Text>
          </View>
        </View>

        {/* Service Info */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text variant="bodySmall" color="textSecondary" style={styles.label}>
              Service:
            </Text>
            <Text variant="bodyLarge" style={styles.value} numberOfLines={1}>
              {serviceName}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodySmall" color="textSecondary" style={styles.label}>
              Date:
            </Text>
            <Text variant="bodyLarge" style={styles.value}>
              {formatDate(booking.scheduledDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodySmall" color="textSecondary" style={styles.label}>
              Time:
            </Text>
            <Text variant="bodyLarge" style={styles.value}>
              {formatTime(booking.scheduledTime)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text variant="bodySmall" color="textSecondary" style={styles.label}>
              Location:
            </Text>
            <Text variant="bodyLarge" style={styles.value} numberOfLines={2}>
              {booking.location.address}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.footer}>
          <Text variant="h6" style={{ color: theme.colors.primary }}>
            {formatCurrency(booking.totalAmount)}
          </Text>
          <Text variant="caption" color="textSecondary">
            {booking.duration} mins
          </Text>
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.sm,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerDetails: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  label: {
    width: 80,
  },
  value: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});
