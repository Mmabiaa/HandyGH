/**
 * Earnings Summary Card Component
 * Displays total, pending, and completed earnings
 *
 * Requirements: 10.1, 10.2
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../../../shared/components/Card';
import { Text } from '../../../shared/components/Text';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { formatCurrency } from '../../../shared/utils/formatting';

export interface EarningsSummaryCardProps {
  /**
   * Total earnings amount
   */
  totalEarnings: number;

  /**
   * Pending payments amount
   */
  pendingPayments: number;

  /**
   * Completed payments amount
   */
  completedPayments: number;

  /**
   * Loading state
   */
  loading?: boolean;
}

export const EarningsSummaryCard: React.FC<EarningsSummaryCardProps> = ({
  totalEarnings,
  pendingPayments,
  completedPayments,
  loading,
}) => {
  const { theme } = useTheme();

  if (loading) {
    return (
      <Card elevation="md" padding="lg" style={styles.card}>
        <View style={styles.loadingContainer}>
          <Text variant="body" color="textSecondary">
            Loading earnings...
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card elevation="md" padding="lg" style={styles.card}>
      {/* Total Earnings */}
      <View style={styles.totalSection}>
        <Text variant="caption" color="textSecondary" style={styles.label}>
          Total Earnings
        </Text>
        <Text variant="h3" style={styles.totalAmount}>
          {formatCurrency(totalEarnings)}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Breakdown */}
      <View style={styles.breakdownSection}>
        <View style={styles.breakdownItem}>
          <View style={styles.breakdownHeader}>
            <View
              style={[
                styles.indicator,
                { backgroundColor: theme.colors.success || '#4CAF50' },
              ]}
            />
            <Text variant="body" color="textSecondary">
              Completed
            </Text>
          </View>
          <Text variant="h6" style={styles.breakdownAmount}>
            {formatCurrency(completedPayments)}
          </Text>
        </View>

        <View style={styles.breakdownItem}>
          <View style={styles.breakdownHeader}>
            <View
              style={[
                styles.indicator,
                { backgroundColor: theme.colors.warning || '#FF9800' },
              ]}
            />
            <Text variant="body" color="textSecondary">
              Pending
            </Text>
          </View>
          <Text variant="h6" style={styles.breakdownAmount}>
            {formatCurrency(pendingPayments)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  totalSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  label: {
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalAmount: {
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: spacing.lg,
  },
  breakdownSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.lg,
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownAmount: {
    fontWeight: '600',
  },
});
