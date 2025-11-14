/**
 * Payment Request Screen
 *
 * Screen for providers to request payment after service completion.
 * Displays service total amount and payment collection options.
 *
 * Requirements: 9.5, 9.6
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Text } from '../../../shared/components/Text';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { BookingService } from '../../../core/api/services/BookingService';
import { Booking, BookingStatus } from '../../../core/api/types';
import { formatCurrency, formatDate, formatTime } from '../../../shared/utils/formatting';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/query/queryKeys';
import SocketManager, { SocketEvent } from '../../../core/realtime/SocketManager';

type PaymentRequestScreenRouteProp = RouteProp<
  { PaymentRequest: { bookingId: string } },
  'PaymentRequest'
>;

interface PaymentOption {
  id: string;
  type: 'cash' | 'momo' | 'card';
  label: string;
  description: string;
  icon: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: 'cash',
    type: 'cash',
    label: 'Cash Payment',
    description: 'Collect cash payment from customer',
    icon: '💵',
  },
  {
    id: 'momo',
    type: 'momo',
    label: 'Mobile Money',
    description: 'Customer pays via Mobile Money',
    icon: '📱',
  },
  {
    id: 'card',
    type: 'card',
    label: 'Card Payment',
    description: 'Customer pays with debit/credit card',
    icon: '💳',
  },
];

/**
 * Payment Request Screen
 * Requirements: 9.5, 9.6
 */
const PaymentRequestScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<PaymentRequestScreenRouteProp>();
  const queryClient = useQueryClient();
  const { bookingId } = route.params;

  // State
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string | null>(null);

  // Fetch booking details
  const {
    data: booking,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: () => BookingService.getBookingById(bookingId),
  });

  // Complete booking mutation
  // Requirement 9.6: Update booking status to completed
  const completeBookingMutation = useMutation({
    mutationFn: () =>
      BookingService.updateBookingStatus(bookingId, BookingStatus.COMPLETED),
    onSuccess: (updatedBooking) => {
      queryClient.setQueryData(
        queryKeys.bookings.detail(bookingId),
        updatedBooking
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });

      // Send completion notification to customer
      // Requirement 9.7: Send completion notification to customer
      sendCompletionNotification(updatedBooking);

      // Show success message
      Alert.alert(
        'Service Completed',
        'The service has been marked as completed. Payment has been recorded.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to dashboard
              // @ts-ignore - Navigation types will be properly defined
              navigation.navigate('ProviderDashboard');
            },
          },
        ]
      );
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.message || 'Failed to complete service. Please try again.'
      );
    },
  });

  // Send completion notification to customer
  const sendCompletionNotification = (updatedBooking: Booking) => {
    const socketManager = SocketManager.getInstance();
    if (socketManager.isConnected()) {
      socketManager.emit(SocketEvent.BOOKING_STATUS_UPDATE, {
        bookingId: updatedBooking.id,
        status: updatedBooking.status,
        customerId: updatedBooking.customerId,
        message: 'Service completed. Please leave a review!',
      });
    }
  };

  // Handlers
  const handlePaymentOptionSelect = useCallback((optionId: string) => {
    setSelectedPaymentOption(optionId);
  }, []);

  const handleConfirmPayment = useCallback(() => {
    if (!selectedPaymentOption) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    const option = PAYMENT_OPTIONS.find(opt => opt.id === selectedPaymentOption);

    Alert.alert(
      'Confirm Payment',
      `Confirm that you have received ${formatCurrency(booking?.totalAmount || 0)} via ${option?.label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // Requirement 9.5: Implement payment confirmation
            completeBookingMutation.mutate();
          },
        },
      ]
    );
  }, [selectedPaymentOption, booking, completeBookingMutation]);

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
          Please check your connection and try again
        </Text>
        <Button onPress={() => navigation.goBack()} style={styles.retryButton}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h4" style={styles.title}>
          Payment Request
        </Text>
        <Text variant="body" color="textSecondary">
          Confirm payment collection from customer
        </Text>
      </View>

      {/* Service Summary */}
      <Card style={styles.section}>
        <Text variant="h6" style={styles.sectionTitle}>
          Service Summary
        </Text>
        <View style={styles.infoRow}>
          <Text variant="body" color="textSecondary">
            Service:
          </Text>
          <Text variant="body" style={styles.infoValue}>
            {booking.service?.name}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text variant="body" color="textSecondary">
            Customer:
          </Text>
          <Text variant="body" style={styles.infoValue}>
            {booking.customer?.firstName} {booking.customer?.lastName}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text variant="body" color="textSecondary">
            Date:
          </Text>
          <Text variant="body" style={styles.infoValue}>
            {formatDate(booking.scheduledDate)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text variant="body" color="textSecondary">
            Time:
          </Text>
          <Text variant="body" style={styles.infoValue}>
            {formatTime(booking.scheduledTime)}
          </Text>
        </View>
      </Card>

      {/* Payment Amount */}
      {/* Requirement 9.5: Display service total amount */}
      <Card style={styles.amountCard}>
        <Text variant="body" color="textSecondary" style={styles.amountLabel}>
          Total Amount
        </Text>
        <Text variant="h1" style={styles.amountValue}>
          {formatCurrency(booking.totalAmount)}
        </Text>

        {/* Breakdown */}
        <View style={styles.breakdown}>
          <View style={styles.breakdownRow}>
            <Text variant="caption" color="textSecondary">
              Service Fee:
            </Text>
            <Text variant="caption" color="textSecondary">
              {formatCurrency(booking.service?.price || 0)}
            </Text>
          </View>
          {booking.addOns && booking.addOns.length > 0 && (
            <>
              {booking.addOns.map((addOn, index) => (
                <View key={index} style={styles.breakdownRow}>
                  <Text variant="caption" color="textSecondary">
                    {addOn.name}:
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {formatCurrency(addOn.price)}
                  </Text>
                </View>
              ))}
            </>
          )}
        </View>
      </Card>

      {/* Payment Collection Options */}
      {/* Requirement 9.5: Show payment collection options */}
      <Card style={styles.section}>
        <Text variant="h6" style={styles.sectionTitle}>
          Payment Method
        </Text>
        <Text variant="caption" color="textSecondary" style={styles.sectionSubtitle}>
          Select how the customer will pay
        </Text>

        <View style={styles.paymentOptions}>
          {PAYMENT_OPTIONS.map((option) => (
            <View
              key={option.id}
              style={[
                styles.paymentOption,
                selectedPaymentOption === option.id && {
                  borderColor: theme.colors.primary,
                  backgroundColor: `${theme.colors.primary}10`,
                },
              ]}
            >
              <Button
                variant="ghost"
                size="medium"
                onPress={() => handlePaymentOptionSelect(option.id)}
                style={styles.paymentOptionButton}
              >
                <View style={styles.paymentOptionContent}>
                  <View style={styles.paymentIcon}>
                    <Text style={styles.iconText}>{option.icon}</Text>
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text variant="body" style={styles.paymentLabel}>
                      {option.label}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      {option.description}
                    </Text>
                  </View>
                  {selectedPaymentOption === option.id && (
                    <View
                      style={[
                        styles.selectedIndicator,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </View>
              </Button>
            </View>
          ))}
        </View>
      </Card>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text variant="caption" color="textSecondary" style={styles.infoText}>
          ℹ️ By confirming payment, you acknowledge that you have received the full payment amount from the customer. The booking will be marked as completed.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          variant="outline"
          size="large"
          onPress={() => navigation.goBack()}
          disabled={completeBookingMutation.isPending}
          style={styles.actionButton}
        >
          Back
        </Button>
        <Button
          variant="primary"
          size="large"
          onPress={handleConfirmPayment}
          loading={completeBookingMutation.isPending}
          disabled={completeBookingMutation.isPending || !selectedPaymentOption}
          style={styles.actionButton}
        >
          Confirm Payment
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
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
  retryButton: {
    minWidth: 120,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  infoValue: {
    flex: 1,
    textAlign: 'right',
  },
  amountCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: '#FFFFFF',
  },
  amountLabel: {
    marginBottom: spacing.xs,
  },
  amountValue: {
    color: '#4CAF50',
    marginBottom: spacing.lg,
  },
  breakdown: {
    width: '100%',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: spacing.xs,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  paymentOptions: {
    gap: spacing.md,
  },
  paymentOption: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  paymentOptionButton: {
    width: '100%',
    padding: 0,
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#FFF3CD',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  infoText: {
    color: '#856404',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

export default PaymentRequestScreen;
