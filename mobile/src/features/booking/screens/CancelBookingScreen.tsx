/**
 * Cancel Booking Screen
 *
 * Handles booking cancellation with reason selection and policy display
 *
 * Requirements: 5.7, 5.8
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBooking, useCancelBooking } from '../../../core/query/hooks/useBookings';
import { Button, TextInput } from '../../../shared/components';
import { formatDate, formatTime } from '../../../shared/utils/formatting';

type RouteParams = {
  CancelBooking: {
    bookingId: string;
  };
};

type NavigationProp = NativeStackNavigationProp<any>;

const CANCELLATION_REASONS = [
  'Schedule conflict',
  'Found another provider',
  'Service no longer needed',
  'Price too high',
  'Provider not responding',
  'Emergency situation',
  'Other',
];

const CancelBookingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RouteParams, 'CancelBooking'>>();
  const { bookingId } = route.params;

  const { data: booking, isLoading } = useBooking(bookingId);
  const cancelBooking = useCancelBooking();

  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
    if (reason !== 'Other') {
      setCustomReason('');
    }
  };

  const handleCancel = async () => {
    if (!selectedReason) {
      Alert.alert('Reason Required', 'Please select a reason for cancellation');
      return;
    }

    if (selectedReason === 'Other' && !customReason.trim()) {
      Alert.alert('Details Required', 'Please provide details for cancellation');
      return;
    }

    const reason = selectedReason === 'Other' ? customReason : selectedReason;

    // Show confirmation dialog
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        {
          text: 'No, Keep Booking',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await cancelBooking.mutateAsync({
                bookingId,
                reason,
              });

              // Show success message
              Alert.alert(
                'Booking Cancelled',
                'Your booking has been cancelled successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to booking list
                      navigation.navigate('BookingList');
                    },
                  },
                ]
              );
            } catch (error: any) {
              Alert.alert(
                'Cancellation Failed',
                error.message || 'Unable to cancel booking. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  // Render loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D32F2F" />
        <Text style={styles.loadingText}>Loading booking...</Text>
      </View>
    );
  }

  // Render error state
  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Booking Not Found</Text>
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Cancel Booking</Text>
            <Text style={styles.warningText}>
              This action cannot be undone. Please review the cancellation policy below.
            </Text>
          </View>
        </View>

        {/* Booking Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.bookingSummary}>
            <Text style={styles.serviceName}>{booking.service?.name || 'Service'}</Text>
            <Text style={styles.providerName}>
              {booking.provider?.businessName || 'Provider'}
            </Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date:</Text>
              <Text style={styles.summaryValue}>{formatDate(booking.scheduledDate)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time:</Text>
              <Text style={styles.summaryValue}>{formatTime(booking.scheduledTime)}</Text>
            </View>
          </View>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cancellation Policy</Text>
          <View style={styles.policyCard}>
            <View style={styles.policyItem}>
              <Text style={styles.policyIcon}>✓</Text>
              <Text style={styles.policyText}>
                Free cancellation up to 24 hours before scheduled time
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.policyIcon}>✓</Text>
              <Text style={styles.policyText}>
                50% refund for cancellations within 24 hours
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.policyIcon}>✓</Text>
              <Text style={styles.policyText}>
                No refund for cancellations within 2 hours of service
              </Text>
            </View>
            <View style={styles.policyItem}>
              <Text style={styles.policyIcon}>ℹ️</Text>
              <Text style={styles.policyText}>
                Refunds are processed within 5-7 business days
              </Text>
            </View>
          </View>
        </View>

        {/* Cancellation Reason */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Cancellation *</Text>
          <Text style={styles.sectionDescription}>
            Please let us know why you're cancelling this booking
          </Text>
          <View style={styles.reasonsList}>
            {CANCELLATION_REASONS.map((reason) => (
              <Pressable
                key={reason}
                style={({ pressed }) => [
                  styles.reasonButton,
                  selectedReason === reason && styles.reasonButtonSelected,
                  pressed && styles.reasonButtonPressed,
                ]}
                onPress={() => handleReasonSelect(reason)}
                accessibilityRole="radio"
                accessibilityState={{ checked: selectedReason === reason }}
                accessibilityLabel={`Select reason: ${reason}`}
              >
                <View
                  style={[
                    styles.radioButton,
                    selectedReason === reason && styles.radioButtonSelected,
                  ]}
                >
                  {selectedReason === reason && <View style={styles.radioButtonInner} />}
                </View>
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === reason && styles.reasonTextSelected,
                  ]}
                >
                  {reason}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Custom Reason Input */}
          {selectedReason === 'Other' && (
            <View style={styles.customReasonContainer}>
              <TextInput
                label="Please specify"
                value={customReason}
                onChangeText={setCustomReason}
                placeholder="Enter your reason..."
                multiline
                numberOfLines={4}
                maxLength={200}
                accessibilityLabel="Custom cancellation reason"
                style={styles.customReasonInput}
              />
              <Text style={styles.characterCount}>{customReason.length}/200</Text>
            </View>
          )}
        </View>

        {/* Impact Notice */}
        <View style={styles.impactNotice}>
          <Text style={styles.impactTitle}>Please Note:</Text>
          <Text style={styles.impactText}>
            • Frequent cancellations may affect your account standing
          </Text>
          <Text style={styles.impactText}>
            • The provider will be notified of this cancellation
          </Text>
          <Text style={styles.impactText}>
            • You can rebook with the same provider anytime
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          variant="outline"
          onPress={() => navigation.goBack()}
          accessibilityLabel="Keep booking"
          style={styles.actionButton}
          disabled={isSubmitting}
        >
          Keep Booking
        </Button>
        <Button
          variant="primary"
          onPress={handleCancel}
          accessibilityLabel="Confirm cancellation"
          style={[styles.actionButton, styles.cancelButton]}
          loading={isSubmitting}
          disabled={!selectedReason || isSubmitting}
        >
          Cancel Booking
        </Button>
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
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  warningBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 16,
    marginBottom: 8,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#EF6C00',
    lineHeight: 20,
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
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 16,
  },
  bookingSummary: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#757575',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
  },
  policyCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
  },
  policyItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  policyIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  policyText: {
    flex: 1,
    fontSize: 14,
    color: '#424242',
    lineHeight: 20,
  },
  reasonsList: {
    gap: 12,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reasonButtonSelected: {
    backgroundColor: '#FFEBEE',
    borderColor: '#D32F2F',
  },
  reasonButtonPressed: {
    opacity: 0.7,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#D32F2F',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D32F2F',
  },
  reasonText: {
    flex: 1,
    fontSize: 15,
    color: '#424242',
  },
  reasonTextSelected: {
    color: '#D32F2F',
    fontWeight: '500',
  },
  customReasonContainer: {
    marginTop: 16,
  },
  customReasonInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'right',
    marginTop: 4,
  },
  impactNotice: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 8,
  },
  impactText: {
    fontSize: 13,
    color: '#1976D2',
    marginBottom: 4,
    lineHeight: 18,
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
    flexDirection: 'row',
    gap: 12,
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
    flex: 1,
  },
  cancelButton: {
    backgroundColor: '#D32F2F',
  },
});

export default CancelBookingScreen;
