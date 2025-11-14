/**
 * Transaction Card Component
 * Displays a single transaction in the payment history
 *
 * Requirements: 10.6
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Card } from '../../../shared/components/Card';
import { Text } from '../../../shared/components/Text';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { Transaction } from '../../../core/api/services/EarningsService';
import { formatCurrency, formatDate } from '../../../shared/utils/formatting';

export interface TransactionCardProps {
  /**
   * Transaction data
   */
  transaction: Transaction;

  /**
   * Callback when transaction is pressed
   */
  onPress?: () => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => {
  const { theme } = useTheme();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return theme.colors.success || '#4CAF50';
      case 'pending':
        return theme.colors.warning || '#FF9800';
      case 'failed':
        return theme.colors.error || '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`View transaction details for ${transaction.serviceName}`}
    >
      <Card elevation="sm" padding="md" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.serviceInfo}>
            <Text variant="body" style={styles.serviceName}>
              {transaction.serviceName}
            </Text>
            <Text variant="caption" color="textSecondary">
              {transaction.customerName}
            </Text>
          </View>
          <View style={styles.amountContainer}>
            <Text variant="h6" style={styles.amount}>
              {formatCurrency(transaction.amount)}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(transaction.status) },
              ]}
            >
              <Text variant="caption" style={styles.statusText}>
                {getStatusLabel(transaction.status)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text variant="caption" color="textSecondary">
            {formatDate(transaction.date, 'short')} • {transaction.paymentMethod}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  serviceInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  serviceName: {
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  amount: {
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
