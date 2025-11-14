/**
 * Transaction Details Screen
 *
 * Displays detailed information about a specific transaction.
 *
 * Requirements: 10.6
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text } from '../../../shared/components/Text';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { spacing } from '../../../core/theme/spacing';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { useTransactionDetails } from '../hooks/useEarnings';
import { formatCurrency, formatDate } from '../../../shared/utils/formatting';

interface TransactionDetailsScreenProps {
  route: {
    params: {
      transactionId: string;
    };
  };
  navigation: any;
}

const TransactionDetailsScreen: React.FC<TransactionDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { transactionId } = route.params;
  const { theme } = useTheme();
  const { data: transaction, isLoading } = useTransactionDetails(transactionId);

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

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="body" color="textSecondary">
            Loading transaction details...
          </Text>
        </View>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="body" color="textSecondary">
            Transaction not found
          </Text>
          <Button
            variant="primary"
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(transaction.status) },
          ]}
        >
          <Text variant="h6" style={styles.statusText}>
            {getStatusLabel(transaction.status)}
          </Text>
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text variant="caption" color="textSecondary" style={styles.amountLabel}>
          Transaction Amount
        </Text>
        <Text variant="h2" style={styles.amount}>
          {formatCurrency(transaction.amount)}
        </Text>
      </View>

      {/* Transaction Details */}
      <Card elevation="sm" padding="lg" style={styles.card}>
        <Text variant="h6" style={styles.sectionTitle}>
          Transaction Details
        </Text>

        <View style={styles.detailRow}>
          <Text variant="body" color="textSecondary">
            Transaction ID
          </Text>
          <Text variant="body" style={styles.detailValue}>
            {transaction.id}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="body" color="textSecondary">
            Date
          </Text>
          <Text variant="body" style={styles.detailValue}>
            {formatDate(transaction.date, 'long')}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="body" color="textSecondary">
            Payment Method
          </Text>
          <Text variant="body" style={styles.detailValue}>
            {transaction.paymentMethod}
          </Text>
        </View>
      </Card>

      {/* Service Details */}
      <Card elevation="sm" padding="lg" style={styles.card}>
        <Text variant="h6" style={styles.sectionTitle}>
          Service Details
        </Text>

        <View style={styles.detailRow}>
          <Text variant="body" color="textSecondary">
            Service
          </Text>
          <Text variant="body" style={styles.detailValue}>
            {transaction.serviceName}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="body" color="textSecondary">
            Customer
          </Text>
          <Text variant="body" style={styles.detailValue}>
            {transaction.customerName}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text variant="body" color="textSecondary">
            Booking ID
          </Text>
          <Text variant="body" style={styles.detailValue}>
            {transaction.bookingId}
          </Text>
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          variant="outline"
          onPress={() => navigation.navigate('BookingDetails', { bookingId: transaction.bookingId })}
          accessibilityLabel="View booking details"
        >
          View Booking
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  amountLabel: {
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontWeight: 'bold',
  },
  card: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailValue: {
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  actions: {
    gap: spacing.md,
  },
});

export default TransactionDetailsScreen;
