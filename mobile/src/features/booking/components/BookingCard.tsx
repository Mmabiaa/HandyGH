/**
 * Booking Card Component
 *
 * Displays booking information with status indicators
 *
 * Requirements: 5.2, 5.3
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Booking, BookingStatus } from '../../../core/api/types';
import { formatDate, formatTime, formatCurrency } from '../../../shared/utils/formatting';

interface BookingCardProps {
  booking: Booking;
  onPress: () => void;
  variant?: 'active' | 'upcoming' | 'completed';
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress, variant }) => {
  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.PENDING:
        return '#FFA726'; // Orange
      case BookingStatus.CONFIRMED:
        return '#42A5F5'; // Blue
      case BookingStatus.ON_THE_WAY:
      case BookingStatus.ARRIVED:
        return '#66BB6A'; // Green
      case BookingStatus.IN_PROGRESS:
        return '#AB47BC'; // Purple
      case BookingStatus.COMPLETED:
        return '#26A69A'; // Teal
      case BookingStatus.CANCELLED:
        return '#EF5350'; // Red
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const getStatusLabel = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'Pending';
      case BookingStatus.CONFIRMED:
        return 'Confirmed';
      case BookingStatus.ON_THE_WAY:
        return 'On the Way';
      case BookingStatus.ARRIVED:
        return 'Arrived';
      case BookingStatus.IN_PROGRESS:
        return 'In Progress';
      case BookingStatus.COMPLETED:
        return 'Completed';
      case BookingStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  const statusColor = getStatusColor(booking.status);
  const statusLabel = getStatusLabel(booking.status);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`View booking details for ${booking.service?.name || 'service'}`}
      accessibilityHint="Double tap to view full booking details"
    >
      <View style={styles.content}>
        {/* Status Indicator */}
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Service Name */}
          <Text style={styles.serviceName} numberOfLines={1}>
            {booking.service?.name || 'Service'}
          </Text>

          {/* Provider Name */}
          <Text style={styles.providerName} numberOfLines={1}>
            {booking.provider?.businessName || 'Provider'}
          </Text>

          {/* Date and Time */}
          <View style={styles.dateTimeRow}>
            <Text style={styles.dateTime}>
              {formatDate(booking.scheduledDate)} • {formatTime(booking.scheduledTime)}
            </Text>
          </View>

          {/* Location */}
          <Text style={styles.location} numberOfLines={1}>
            📍 {booking.location.address}
          </Text>
        </View>

        {/* Right Section */}
        <View style={styles.rightSection}>
          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          {/* Amount */}
          <Text style={styles.amount}>
            {formatCurrency(booking.totalAmount, booking.currency)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  pressed: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
  },
  statusIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  mainContent: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateTime: {
    fontSize: 14,
    color: '#424242',
    fontWeight: '500',
  },
  location: {
    fontSize: 13,
    color: '#757575',
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },
});

export default BookingCard;
