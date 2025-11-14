/**
 * Service Execution Screen
 *
 * Screen for providers to manage active service appointments.
 * Displays booking details, customer info, service checklist, and service timer.
 *
 * Requirements: 9.1, 9.2
 */

import React, { useState, useEffect, useCallback } from 'react';
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
import { StatusUpdateModal } from '../components/StatusUpdateModal';
import SocketManager, { SocketEvent } from '../../../core/realtime/SocketManager';

type ServiceExecutionScreenRouteProp = RouteProp<
  { ServiceExecution: { bookingId: string } },
  'ServiceExecution'
>;

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

/**
 * Service Execution Screen
 * Requirements: 9.1, 9.2
 */
const ServiceExecutionScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<ServiceExecutionScreenRouteProp>();
  const queryClient = useQueryClient();
  const { bookingId } = route.params;

  // State
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: '1', label: 'Verify customer identity', completed: false },
    { id: '2', label: 'Inspect service area', completed: false },
    { id: '3', label: 'Confirm service requirements', completed: false },
    { id: '4', label: 'Gather necessary tools/materials', completed: false },
  ]);
  const [serviceStartTime, setServiceStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // Fetch booking details
  const {
    data: booking,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.bookings.detail(bookingId),
    queryFn: () => BookingService.getBookingById(bookingId),
  });

  // Start service mutation
  // Requirement 9.2: Update booking status to in-progress
  const startServiceMutation = useMutation({
    mutationFn: () =>
      BookingService.updateBookingStatus(bookingId, BookingStatus.IN_PROGRESS),
    onSuccess: (updatedBooking) => {
      queryClient.setQueryData(
        queryKeys.bookings.detail(bookingId),
        updatedBooking
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      setServiceStartTime(new Date());

      // Requirement 9.9: Send real-time notification to customer
      sendStatusNotification(updatedBooking);
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.message || 'Failed to start service. Please try again.'
      );
    },
  });

  // Status update mutation
  // Requirement 9.8: Implement status update API calls
  const updateStatusMutation = useMutation({
    mutationFn: (status: BookingStatus) =>
      BookingService.updateBookingStatus(bookingId, status),
    onSuccess: (updatedBooking) => {
      queryClient.setQueryData(
        queryKeys.bookings.detail(bookingId),
        updatedBooking
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
      setShowStatusModal(false);

      // Requirement 9.9: Send real-time notification to customer
      sendStatusNotification(updatedBooking);

      Alert.alert('Success', 'Status updated successfully');
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.message || 'Failed to update status. Please try again.'
      );
    },
  });

  // Send real-time notification to customer
  // Requirement 9.9: Send real-time notifications to customer
  const sendStatusNotification = (updatedBooking: Booking) => {
    const socketManager = SocketManager.getInstance();
    if (socketManager.isConnected()) {
      socketManager.emit(SocketEvent.BOOKING_STATUS_UPDATE, {
        bookingId: updatedBooking.id,
        status: updatedBooking.status,
        customerId: updatedBooking.customerId,
      });
    }
  };

  // Timer effect
  useEffect(() => {
    if (!serviceStartTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - serviceStartTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [serviceStartTime]);

  // Initialize service start time if already in progress
  useEffect(() => {
    if (booking?.status === BookingStatus.IN_PROGRESS && !serviceStartTime) {
      // Estimate start time based on updatedAt
      const updatedAt = new Date(booking.updatedAt);
      setServiceStartTime(updatedAt);
    }
  }, [booking, serviceStartTime]);

  // Handlers
  const handleChecklistToggle = useCallback((itemId: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  }, []);

  const handleStartService = useCallback(() => {
    Alert.alert(
      'Start Service',
      'Are you ready to start the service?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: () => startServiceMutation.mutate(),
        },
      ]
    );
  }, [startServiceMutation]);

  // Requirement 9.3, 9.4: Handle service completion
  const handleCompleteService = useCallback(() => {
    Alert.alert(
      'Complete Service',
      'Are you ready to complete this service and proceed to payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            // Navigate to payment request screen
            // Requirement 9.4: Navigate to PaymentRequestScreen
            // @ts-ignore - Navigation types will be properly defined
            navigation.navigate('PaymentRequest', { bookingId });
          },
        },
      ]
    );
  }, [navigation, bookingId]);

  const handleUpdateStatus = useCallback(() => {
    setShowStatusModal(true);
  }, []);

  const handleStatusUpdate = useCallback(
    (status: BookingStatus) => {
      updateStatusMutation.mutate(status);
    },
    [updateStatusMutation]
  );

  // Format elapsed time
  const formatElapsedTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const isServiceStarted = booking.status === BookingStatus.IN_PROGRESS;
  const canStartService =
    booking.status === BookingStatus.CONFIRMED ||
    booking.status === BookingStatus.ARRIVED;
  const canUpdateStatus =
    booking.status === BookingStatus.CONFIRMED ||
    booking.status === BookingStatus.ON_THE_WAY ||
    booking.status === BookingStatus.ARRIVED;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h4" style={styles.title}>
          Service Execution
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(booking.status, theme) },
          ]}
        >
          <Text variant="caption" style={styles.statusText}>
            {getStatusLabel(booking.status)}
          </Text>
        </View>
      </View>

      {/* Service Timer */}
      {/* Requirement 9.1: Show service timer and progress */}
      {isServiceStarted && (
        <Card style={styles.timerCard}>
          <Text variant="body" color="textSecondary" style={styles.timerLabel}>
            Service Duration
          </Text>
          <Text variant="h2" style={styles.timerValue}>
            {formatElapsedTime(elapsedTime)}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    (elapsedTime / (booking.duration * 60)) * 100,
                    100
                  )}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <Text variant="caption" color="textSecondary" style={styles.estimatedTime}>
            Estimated: {booking.duration} minutes
          </Text>
        </Card>
      )}

      {/* Customer Information */}
      {/* Requirement 9.1: Display customer info */}
      <Card style={styles.section}>
        <Text variant="h6" style={styles.sectionTitle}>
          Customer Information
        </Text>
        <View style={styles.infoRow}>
          <Text variant="body" color="textSecondary">
            Name:
          </Text>
          <Text variant="body" style={styles.infoValue}>
            {booking.customer?.firstName} {booking.customer?.lastName}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text variant="body" color="textSecondary">
            Phone:
          </Text>
          <Text variant="body" style={styles.infoValue}>
            {booking.customer?.phoneNumber || 'N/A'}
          </Text>
        </View>
      </Card>

      {/* Booking Details */}
      {/* Requirement 9.1: Display active booking details */}
      <Card style={styles.section}>
        <Text variant="h6" style={styles.sectionTitle}>
          Booking Details
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
        <View style={styles.infoRow}>
          <Text variant="body" color="textSecondary">
            Location:
          </Text>
          <Text variant="body" style={[styles.infoValue, styles.locationText]}>
            {booking.location.address}
          </Text>
        </View>
        {booking.locationNotes && (
          <View style={styles.infoRow}>
            <Text variant="body" color="textSecondary">
              Notes:
            </Text>
            <Text variant="body" style={[styles.infoValue, styles.notesText]}>
              {booking.locationNotes}
            </Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <Text variant="body" color="textSecondary">
            Total Amount:
          </Text>
          <Text variant="h6" style={styles.amountValue}>
            {formatCurrency(booking.totalAmount)}
          </Text>
        </View>
      </Card>

      {/* Service Checklist */}
      {/* Requirement 9.1: Add service checklist functionality */}
      <Card style={styles.section}>
        <Text variant="h6" style={styles.sectionTitle}>
          Service Checklist
        </Text>
        <Text variant="caption" color="textSecondary" style={styles.checklistSubtitle}>
          Complete these items before starting the service
        </Text>
        <View style={styles.checklistContainer}>
          {checklist.map((item) => (
            <View key={item.id} style={styles.checklistItem}>
              <Button
                variant="ghost"
                size="small"
                onPress={() => handleChecklistToggle(item.id)}
                style={styles.checkboxButton}
              >
                <View
                  style={[
                    styles.checkbox,
                    item.completed && {
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary,
                    },
                  ]}
                >
                  {item.completed && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </Button>
              <Text
                variant="body"
                style={[
                  styles.checklistLabel,
                  item.completed && styles.checklistLabelCompleted,
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {canUpdateStatus && (
          <Button
            variant="outline"
            size="large"
            onPress={handleUpdateStatus}
            disabled={updateStatusMutation.isPending}
            style={styles.actionButton}
          >
            Update Status
          </Button>
        )}

        {!isServiceStarted && canStartService && (
          <Button
            variant="primary"
            size="large"
            onPress={handleStartService}
            loading={startServiceMutation.isPending}
            disabled={startServiceMutation.isPending}
            style={styles.actionButton}
          >
            Start Service
          </Button>
        )}

        {isServiceStarted && (
          <Button
            variant="primary"
            size="large"
            onPress={handleCompleteService}
            style={styles.actionButton}
          >
            Complete Service
          </Button>
        )}
      </View>

      {/* Status Update Modal */}
      <StatusUpdateModal
        visible={showStatusModal}
        currentStatus={booking.status}
        onClose={() => setShowStatusModal(false)}
        onStatusUpdate={handleStatusUpdate}
        loading={updateStatusMutation.isPending}
      />
    </ScrollView>
  );
};

// Helper functions
const getStatusColor = (status: BookingStatus, theme: any): string => {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return theme.colors.info || '#2196F3';
    case BookingStatus.IN_PROGRESS:
      return theme.colors.warning || '#FF9800';
    case BookingStatus.ARRIVED:
      return theme.colors.success || '#4CAF50';
    default:
      return theme.colors.textSecondary || '#757575';
  }
};

const getStatusLabel = (status: BookingStatus): string => {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return 'Confirmed';
    case BookingStatus.ON_THE_WAY:
      return 'On the Way';
    case BookingStatus.ARRIVED:
      return 'Arrived';
    case BookingStatus.IN_PROGRESS:
      return 'In Progress';
    default:
      return status;
  }
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  timerCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  timerLabel: {
    marginBottom: spacing.xs,
  },
  timerValue: {
    marginBottom: spacing.md,
    fontVariant: ['tabular-nums'],
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  estimatedTime: {
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
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
  locationText: {
    flexShrink: 1,
  },
  notesText: {
    flexShrink: 1,
  },
  amountValue: {
    color: '#4CAF50',
  },
  checklistSubtitle: {
    marginBottom: spacing.md,
  },
  checklistContainer: {
    gap: spacing.sm,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  checkboxButton: {
    padding: 0,
    marginRight: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checklistLabel: {
    flex: 1,
  },
  checklistLabelCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
});

export default ServiceExecutionScreen;
