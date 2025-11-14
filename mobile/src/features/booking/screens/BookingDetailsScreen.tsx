/**
 * Booking Details Screen
 *
 * Displays complete booking information with status-specific actions
 *
 * Requirements: 5.4, 5.5
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBooking } from '../../../core/query/hooks/useBookings';
import { useAllBookingUpdates } from '../../../core/realtime';
import { BookingStatus } from '../../../core/api/types';
import { formatDate, formatTime, formatCurrency } from '../../../shared/utils/formatting';
import { Button } from '../../../shared/components';

type RouteParams = {
  BookingDetails: {
    bookingId: string;
  };
};

type NavigationProp = NativeStackNavigationProp<any>;

const BookingDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'BookingDetails'>>();
  const { bookingId } = route.params;

  const { data: booking, isLoading } = useBooking(bookingId);

  // Subscribe to real-time booking updates
  useAllBookingUpdates(bookingId);

  const getStatusColor = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.PENDING:
        return '#FFA726';
      case BookingStatus.CONFIRMED:
        return '#42A5F5';
      case BookingStatus.ON_THE_WAY:
      case BookingStatus.ARRIVED:
        return '#66BB6A';
      case BookingStatus.IN_PROGRESS:
        return '#AB47BC';
      case BookingStatus.COMPLETED:
        return '#26A69A';
      case BookingStatus.CANCELLED:
        return '#EF5350';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: BookingStatus): string => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'Pending Confirmation';
      case BookingStatus.CONFIRMED:
        return 'Confirmed';
      case BookingStatus.ON_THE_WAY:
        return 'Provider On the Way';
      case BookingStatus.ARRIVED:
        return 'Provider Arrived';
      case BookingStatus.IN_PROGRESS:
        return 'Service In Progress';
      case BookingStatus.COMPLETED:
        return 'Completed';
      case BookingStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleMessageProvider = () => {
    if (booking) {
      navigation.navigate('BookingChat', { bookingId: booking.id });
    }
  };

  const handleCancelBooking = () => {
    if (booking) {
      navigation.navigate('CancelBooking', { bookingId: booking.id });
    }
  };

  const handleLeaveReview = () => {
    if (booking) {
      navigation.navigate('ReviewSubmission', { bookingId: booking.id });
    }
  };

  const handleViewProvider = () => {
    if (booking?.provider) {
      navigation.navigate('ProviderDetail', { providerId: booking.provider.id });
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  // Render error state
  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Booking Not Found</Text>
        <Text style={styles.errorDescription}>
          Unable to load booking details
        </Text>
        <Button
          variant="primary"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
        >
          Go Back
        </Button>
      </View>
    );
  }

  const statusColor = getStatusColor(booking.status);
  const statusLabel = getStatusLabel(booking.status);

  // Determine which actions to show based on status
  const showMessageButton =
    booking.status === BookingStatus.CONFIRMED ||
    booking.status === BookingStatus.ON_THE_WAY ||
    booking.status === BookingStatus.ARRIVED ||
    booking.status === BookingStatus.IN_PROGRESS;

  const showCancelButton =
    booking.status === BookingStatus.PENDING ||
    booking.status === BookingStatus.CONFIRMED;

  const showReviewButton =
    booking.status === BookingStatus.COMPLETED && !booking.review;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status Timeline */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>

          {/* Status Timeline */}
          <View style={styles.timeline}>
            <TimelineItem
              label="Booking Created"
              time={formatDate(booking.createdAt)}
              isCompleted={true}
              isActive={false}
            />
            <TimelineItem
              label="Confirmed"
              time={
                booking.status !== BookingStatus.PENDING
                  ? formatDate(booking.updatedAt)
                  : undefined
              }
              isCompleted={booking.status !== BookingStatus.PENDING}
              isActive={booking.status === BookingStatus.CONFIRMED}
            />
            <TimelineItem
              label="In Progress"
              time={
                booking.status === BookingStatus.IN_PROGRESS ||
                booking.status === BookingStatus.COMPLETED
                  ? formatDate(booking.updatedAt)
                  : undefined
              }
              isCompleted={
                booking.status === BookingStatus.IN_PROGRESS ||
                booking.status === BookingStatus.COMPLETED
              }
              isActive={booking.status === BookingStatus.IN_PROGRESS}
            />
            <TimelineItem
              label="Completed"
              time={
                booking.status === BookingStatus.COMPLETED
                  ? formatDate(booking.updatedAt)
                  : undefined
              }
              isCompleted={booking.status === BookingStatus.COMPLETED}
              isActive={booking.status === BookingStatus.COMPLETED}
              isLast={true}
            />
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.card}>
            <Text style={styles.serviceName}>{booking.service?.name || 'Service'}</Text>
            <Text style={styles.serviceDescription}>
              {booking.service?.description || 'No description available'}
            </Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{booking.duration} minutes</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Price:</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(booking.service?.price || 0, booking.currency)}
              </Text>
            </View>
            {booking.addOns && booking.addOns.length > 0 && (
              <>
                <Text style={styles.addOnsTitle}>Add-ons:</Text>
                {booking.addOns.map((addOn) => (
                  <View key={addOn.id} style={styles.addOnRow}>
                    <Text style={styles.addOnName}>• {addOn.name}</Text>
                    <Text style={styles.addOnPrice}>
                      {formatCurrency(addOn.price, booking.currency)}
                    </Text>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>

        {/* Provider Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Provider</Text>
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={handleViewProvider}
            accessibilityRole="button"
            accessibilityLabel="View provider profile"
          >
            <View style={styles.providerHeader}>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>
                  {booking.provider?.businessName || 'Provider'}
                </Text>
                {booking.provider?.isVerified && (
                  <Text style={styles.verifiedBadge}>✓ Verified</Text>
                )}
              </View>
              <Text style={styles.viewProfile}>View Profile →</Text>
            </View>
            {booking.provider && (
              <View style={styles.providerStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>⭐ {booking.provider.rating.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Rating</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{booking.provider.totalServices}</Text>
                  <Text style={styles.statLabel}>Services</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{booking.provider.responseRate}%</Text>
                  <Text style={styles.statLabel}>Response</Text>
                </View>
              </View>
            )}
          </Pressable>
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📅 Date:</Text>
              <Text style={styles.detailValue}>{formatDate(booking.scheduledDate)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>🕐 Time:</Text>
              <Text style={styles.detailValue}>{formatTime(booking.scheduledTime)}</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.card}>
            <Text style={styles.locationAddress}>📍 {booking.location.address}</Text>
            {booking.location.city && (
              <Text style={styles.locationCity}>
                {booking.location.city}, {booking.location.region}
              </Text>
            )}
            {booking.locationNotes && (
              <>
                <Text style={styles.notesLabel}>Notes:</Text>
                <Text style={styles.notesText}>{booking.locationNotes}</Text>
              </>
            )}
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(booking.totalAmount, booking.currency)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Status:</Text>
              <Text
                style={[
                  styles.paymentStatus,
                  booking.paymentStatus === 'completed' && styles.paymentStatusCompleted,
                ]}
              >
                {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
              </Text>
            </View>
            {booking.paymentMethod && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Method:</Text>
                <Text style={styles.detailValue}>
                  {booking.paymentMethod.type.toUpperCase()}
                  {booking.paymentMethod.provider &&
                    ` (${booking.paymentMethod.provider.toUpperCase()})`}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Cancellation Info */}
        {booking.status === BookingStatus.CANCELLED && booking.cancellationReason && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation</Text>
            <View style={[styles.card, styles.cancellationCard]}>
              <Text style={styles.cancellationReason}>{booking.cancellationReason}</Text>
            </View>
          </View>
        )}

        {/* Booking Reference */}
        <View style={styles.section}>
          <Text style={styles.referenceLabel}>Booking Reference</Text>
          <Text style={styles.referenceValue}>{booking.id}</Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {(showMessageButton || showCancelButton || showReviewButton) && (
        <View style={styles.actionButtons}>
          {showMessageButton && (
            <Button
              variant="secondary"
              onPress={handleMessageProvider}
              accessibilityLabel="Message provider"
              style={styles.actionButton}
            >
              💬 Message Provider
            </Button>
          )}
          {showCancelButton && (
            <Button
              variant="outline"
              onPress={handleCancelBooking}
              accessibilityLabel="Cancel booking"
              style={styles.actionButton}
            >
              Cancel Booking
            </Button>
          )}
          {showReviewButton && (
            <Button
              variant="primary"
              onPress={handleLeaveReview}
              accessibilityLabel="Leave review"
              style={styles.actionButton}
            >
              ⭐ Leave Review
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

// Timeline Item Component
interface TimelineItemProps {
  label: string;
  time?: string;
  isCompleted: boolean;
  isActive: boolean;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  label,
  time,
  isCompleted,
  isActive,
  isLast = false,
}) => {
  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineIndicator}>
        <View
          style={[
            styles.timelineDot,
            isCompleted && styles.timelineDotCompleted,
            isActive && styles.timelineDotActive,
          ]}
        >
          {isCompleted && <Text style={styles.timelineCheck}>✓</Text>}
        </View>
        {!isLast && (
          <View
            style={[
              styles.timelineLine,
              isCompleted && styles.timelineLineCompleted,
            ]}
          />
        )}
      </View>
      <View style={styles.timelineContent}>
        <Text
          style={[
            styles.timelineLabel,
            isCompleted && styles.timelineLabelCompleted,
          ]}
        >
          {label}
        </Text>
        {time && <Text style={styles.timelineTime}>{time}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F5F5F5',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    borderColor: '#66BB6A',
    backgroundColor: '#66BB6A',
  },
  timelineDotActive: {
    borderColor: '#42A5F5',
    backgroundColor: '#42A5F5',
  },
  timelineCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#66BB6A',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
    marginBottom: 2,
  },
  timelineLabelCompleted: {
    color: '#212121',
  },
  timelineTime: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
  },
  cardPressed: {
    opacity: 0.7,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#757575',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  addOnsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginTop: 8,
    marginBottom: 8,
  },
  addOnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  addOnName: {
    fontSize: 14,
    color: '#424242',
  },
  addOnPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#66BB6A',
    fontWeight: '600',
  },
  viewProfile: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: '500',
  },
  providerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
  },
  locationAddress: {
    fontSize: 15,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  locationCity: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginTop: 8,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D32F2F',
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFA726',
  },
  paymentStatusCompleted: {
    color: '#66BB6A',
  },
  cancellationCard: {
    backgroundColor: '#FFEBEE',
  },
  cancellationReason: {
    fontSize: 14,
    color: '#C62828',
    lineHeight: 20,
  },
  referenceLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  referenceValue: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#757575',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  actionButton: {
    marginBottom: 8,
  },
});

export default BookingDetailsScreen;
