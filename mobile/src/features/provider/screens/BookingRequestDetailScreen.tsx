/**
 * Booking Request Detail Screen
 *
 * Displays detailed booking request information with accept/decline actions
 * Requirements: 8.7, 8.8, 8.9, 8.10
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../../shared/components/Text';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { useQuery } from '@tanstack/react-query';
import { BookingService } from '../../../core/api/services/BookingService';
import { queryKeys } from '../../../core/query/queryKeys';
import {
  useAcceptBooking,
  useDeclineBooking,
} from '../../../core/query/hooks/useBookingRequests';
import { formatCurrency, formatDate, formatTime } from '../../../shared/utils/formatting';
import type { ProviderStackParamList } from '../../../core/navigation/types';

type RouteProps = RouteProp<ProviderStackParamList, 'BookingRequestDetail'>;
type NavigationProp = NativeStackNavigationProp<
  ProviderStackParamList,
  'BookingRequestDetail'
>;

// Decline reasons
const DECLINE_REASONS = [
  'Schedule conflict',
  'Outside service area',
  'Service not available',
  'Insufficient information',
  'Other',
];

/**
 * Booking Request Detail Screen
 * Requirements: 8.7, 8.8, 8.9, 8.10
 */
const BookingRequestDetailScreen: React.FC = () => {
  const { theme } = useTheme();
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { bookingId } = route.params;

  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  // Fetch booking details
  // Requirement 8.7: Display booking request detail view
  const { data: booking, isLoading, error } = useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: () => BookingService.getBookingById(bookingId),
  });

  // Accept booking mutation
  // Requirement 8.9: Update booking status to confirmed
  const acceptMutation = useAcceptBooking();

  // Decline booking mutation
  // Requirement 8.10: Decline booking with reason
  const declineMutation = useDeclineBooking();

  // Handle accept booking
  // Requirement 8.9: Accept booking request
  const handleAccept = useCallback(() => {
    Alert.alert(
      'Accept Booking',
      'Are you sure you want to accept this booking request?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Accept',
          onPress: () => {
            acceptMutation.mutate(bookingId, {
              onSuccess: () => {
                Alert.alert(
                  'Success',
                  'Booking request accepted successfully',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack(),
                    },
                  ]
                );
              },
              onError: (error: any) => {
                Alert.alert(
                  'Error',
                  error.message || 'Failed to accept booking request'
                );
              },
            });
          },
        },
      ]
    );
  }, [bookingId, acceptMutation, navigation]);

  // Handle decline booking
  // Requirement 8.10: Decline booking with reason
  const handleDecline = useCallback(() => {
    setShowDeclineModal(true);
  }, []);

  // Handle decline confirmation
  // Requirement 8.8, 8.10: Implement decline reason selection and API call
  const handleDeclineConfirm = useCallback(() => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for declining');
      return;
    }

    setShowDeclineModal(false);

    declineMutation.mutate(
      { bookingId, reason: selectedReason },
      {
        onSuccess: () => {
          Alert.alert(
            'Declined',
            'Booking request has been declined',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        },
        onError: (error: any) => {
          Alert.alert(
            'Error',
            error.message || 'Failed to decline booking request'
          );
        },
      }
    );
  }, [bookingId, selectedReason, declineMutation, navigation]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="body" color="textSecondary" style={styles.loadingText}>
          Loading booking details...
        </Text>
      </View>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="h6" style={styles.errorTitle}>
          Unable to load booking
        </Text>
        <Text variant="body" color="textSecondary" style={styles.errorMessage}>
          Please try again later
        </Text>
        <Button onPress={() => navigation.goBack()} style={styles.backButton}>
          Go Back
        </Button>
      </View>
    );
  }

  const customerName = booking.customer
    ? `${booking.customer.firstName} ${booking.customer.lastName}`
    : 'Customer';

  const serviceName = booking.service?.name || 'Service';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Customer Information */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h6" style={styles.cardTitle}>
            Customer Information
          </Text>
          <View style={styles.customerSection}>
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
                <Text variant="h5" color="textSecondary">
                  {customerName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.customerInfo}>
              <Text variant="h6">{customerName}</Text>
              {booking.customer?.phoneNumber && (
                <Text variant="bodySmall" color="textSecondary">
                  {booking.customer.phoneNumber}
                </Text>
              )}
            </View>
          </View>
        </Card>

        {/* Service Details */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h6" style={styles.cardTitle}>
            Service Details
          </Text>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" color="textSecondary" style={styles.detailLabel}>
              Service:
            </Text>
            <Text variant="bodyLarge" style={styles.detailValue}>
              {serviceName}
            </Text>
          </View>
          {booking.service?.description && (
            <View style={styles.detailRow}>
              <Text variant="bodySmall" color="textSecondary" style={styles.detailLabel}>
                Description:
              </Text>
              <Text variant="bodySmall" style={styles.detailValue}>
                {booking.service.description}
              </Text>
            </View>
          )}
          <View style={styles.detailRow}>
            <Text variant="bodySmall" color="textSecondary" style={styles.detailLabel}>
              Duration:
            </Text>
            <Text variant="bodyLarge" style={styles.detailValue}>
              {booking.duration} minutes
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" color="textSecondary" style={styles.detailLabel}>
              Amount:
            </Text>
            <Text
              variant="h6"
              style={[styles.detailValue, { color: theme.colors.primary }]}
            >
              {formatCurrency(booking.totalAmount)}
            </Text>
          </View>
        </Card>

        {/* Schedule */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h6" style={styles.cardTitle}>
            Schedule
          </Text>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" color="textSecondary" style={styles.detailLabel}>
              Date:
            </Text>
            <Text variant="bodyLarge" style={styles.detailValue}>
              {formatDate(booking.scheduledDate)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="bodySmall" color="textSecondary" style={styles.detailLabel}>
              Time:
            </Text>
            <Text variant="bodyLarge" style={styles.detailValue}>
              {formatTime(booking.scheduledTime)}
            </Text>
          </View>
        </Card>

        {/* Location */}
        <Card elevation="md" style={styles.card}>
          <Text variant="h6" style={styles.cardTitle}>
            Service Location
          </Text>
          <Text variant="bodyLarge" style={styles.address}>
            {booking.location.address}
          </Text>
          <Text variant="bodySmall" color="textSecondary">
            {booking.location.city}, {booking.location.region}
          </Text>
          {booking.locationNotes && (
            <View style={styles.notesSection}>
              <Text variant="bodySmall" color="textSecondary" style={styles.notesLabel}>
                Notes:
              </Text>
              <Text variant="bodySmall">{booking.locationNotes}</Text>
            </View>
          )}
        </Card>

        {/* Additional Notes */}
        {booking.notes && (
          <Card elevation="md" style={styles.card}>
            <Text variant="h6" style={styles.cardTitle}>
              Additional Notes
            </Text>
            <Text variant="bodyLarge">{booking.notes}</Text>
          </Card>
        )}
      </ScrollView>

      {/* Action Buttons */}
      {/* Requirements: 8.8 - Add Accept and Decline action buttons */}
      <View style={styles.actionBar}>
        <Button
          variant="outline"
          size="large"
          onPress={handleDecline}
          style={styles.actionButton}
          disabled={acceptMutation.isPending || declineMutation.isPending}
        >
          Decline
        </Button>
        <Button
          variant="primary"
          size="large"
          onPress={handleAccept}
          style={styles.actionButton}
          loading={acceptMutation.isPending}
          disabled={acceptMutation.isPending || declineMutation.isPending}
        >
          Accept
        </Button>
      </View>

      {/* Decline Reason Modal */}
      {/* Requirement 8.8: Implement decline reason selection dialog */}
      <Modal
        visible={showDeclineModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDeclineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text variant="h6" style={styles.modalTitle}>
              Reason for Declining
            </Text>
            <Text variant="bodySmall" color="textSecondary" style={styles.modalSubtitle}>
              Please select a reason
            </Text>

            <View style={styles.reasonsList}>
              {DECLINE_REASONS.map((reason) => (
                <Pressable
                  key={reason}
                  style={[
                    styles.reasonItem,
                    selectedReason === reason && {
                      backgroundColor: theme.colors.primary + '20',
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => setSelectedReason(reason)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedReason === reason }}
                >
                  <View
                    style={[
                      styles.radioButton,
                      selectedReason === reason && {
                        borderColor: theme.colors.primary,
                      },
                    ]}
                  >
                    {selectedReason === reason && (
                      <View
                        style={[
                          styles.radioButtonInner,
                          { backgroundColor: theme.colors.primary },
                        ]}
                      />
                    )}
                  </View>
                  <Text variant="bodyLarge">{reason}</Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button
                variant="outline"
                size="medium"
                onPress={() => {
                  setShowDeclineModal(false);
                  setSelectedReason(null);
                }}
                style={styles.modalButton}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="medium"
                onPress={handleDeclineConfirm}
                style={styles.modalButton}
                loading={declineMutation.isPending}
                disabled={!selectedReason || declineMutation.isPending}
              >
                Confirm
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100, // Space for action bar
  },
  loadingText: {
    marginTop: spacing.md,
  },
  errorTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  backButton: {
    minWidth: 120,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardTitle: {
    marginBottom: spacing.md,
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    width: 100,
  },
  detailValue: {
    flex: 1,
  },
  address: {
    marginBottom: spacing.xs,
  },
  notesSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  notesLabel: {
    marginBottom: spacing.xs,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
    maxHeight: '80%',
  },
  modalTitle: {
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    marginBottom: spacing.lg,
  },
  reasonsList: {
    marginBottom: spacing.lg,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: spacing.sm,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default BookingRequestDetailScreen;
