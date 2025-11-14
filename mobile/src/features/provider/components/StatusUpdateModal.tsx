/**
 * Status Update Modal Component
 *
 * Modal for providers to update booking status with real-time notifications.
 *
 * Requirements: 9.8, 9.9
 */

import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import { Text } from '../../../shared/components/Text';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { BookingStatus } from '../../../core/api/types';

interface StatusOption {
  status: BookingStatus;
  label: string;
  description: string;
  icon: string;
}

interface StatusUpdateModalProps {
  visible: boolean;
  currentStatus: BookingStatus;
  onClose: () => void;
  onStatusUpdate: (status: BookingStatus) => void;
  loading?: boolean;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    status: BookingStatus.ON_THE_WAY,
    label: 'On the Way',
    description: 'Heading to the service location',
    icon: '🚗',
  },
  {
    status: BookingStatus.ARRIVED,
    label: 'Arrived',
    description: 'Reached the service location',
    icon: '📍',
  },
  {
    status: BookingStatus.IN_PROGRESS,
    label: 'In Progress',
    description: 'Service work has started',
    icon: '🔧',
  },
];

/**
 * Status Update Modal
 * Requirements: 9.8, 9.9
 */
export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  visible,
  currentStatus,
  onClose,
  onStatusUpdate,
  loading = false,
}) => {
  const { theme } = useTheme();
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | null>(null);

  // Filter available status options based on current status
  const getAvailableStatuses = (): StatusOption[] => {
    switch (currentStatus) {
      case BookingStatus.CONFIRMED:
        return STATUS_OPTIONS.filter(
          (opt) => opt.status === BookingStatus.ON_THE_WAY
        );
      case BookingStatus.ON_THE_WAY:
        return STATUS_OPTIONS.filter(
          (opt) =>
            opt.status === BookingStatus.ARRIVED ||
            opt.status === BookingStatus.IN_PROGRESS
        );
      case BookingStatus.ARRIVED:
        return STATUS_OPTIONS.filter(
          (opt) => opt.status === BookingStatus.IN_PROGRESS
        );
      default:
        return [];
    }
  };

  const availableStatuses = getAvailableStatuses();

  const handleStatusSelect = (status: BookingStatus) => {
    setSelectedStatus(status);
  };

  const handleConfirm = () => {
    if (!selectedStatus) {
      Alert.alert('Error', 'Please select a status');
      return;
    }

    // Requirement 9.8: Implement status update API calls
    onStatusUpdate(selectedStatus);
  };

  const handleClose = () => {
    setSelectedStatus(null);
    onClose();
  };

  if (availableStatuses.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <Card style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text variant="h6" style={styles.title}>
                Update Status
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text variant="h6" color="textSecondary">
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Status Options */}
            {/* Requirement 9.8: Create status selection UI */}
            <View style={styles.statusOptions}>
              {availableStatuses.map((option) => (
                <TouchableOpacity
                  key={option.status}
                  style={[
                    styles.statusOption,
                    selectedStatus === option.status && {
                      borderColor: theme.colors.primary,
                      backgroundColor: `${theme.colors.primary}10`,
                    },
                  ]}
                  onPress={() => handleStatusSelect(option.status)}
                  activeOpacity={0.7}
                >
                  <View style={styles.statusIcon}>
                    <Text style={styles.iconText}>{option.icon}</Text>
                  </View>
                  <View style={styles.statusInfo}>
                    <Text variant="body" style={styles.statusLabel}>
                      {option.label}
                    </Text>
                    <Text variant="caption" color="textSecondary">
                      {option.description}
                    </Text>
                  </View>
                  {selectedStatus === option.status && (
                    <View
                      style={[
                        styles.selectedIndicator,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Info Message */}
            <View style={styles.infoBox}>
              <Text variant="caption" color="textSecondary" style={styles.infoText}>
                💡 The customer will be notified in real-time when you update the status
              </Text>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <Button
                variant="outline"
                size="medium"
                onPress={handleClose}
                disabled={loading}
                style={styles.actionButton}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="medium"
                onPress={handleConfirm}
                loading={loading}
                disabled={loading || !selectedStatus}
                style={styles.actionButton}
              >
                Update Status
              </Button>
            </View>
          </Card>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  modalContent: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  statusOptions: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    gap: spacing.md,
  },
  statusIcon: {
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
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
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
    backgroundColor: '#F5F5F5',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  infoText: {
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
