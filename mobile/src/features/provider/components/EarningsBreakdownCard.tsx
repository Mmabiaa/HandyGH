/**
 * Earnings Breakdown Card Component
 * Displays earnings breakdown by service category
 *
 * Requirements: 10.3
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../../../shared/components/Card';
import { Text } from '../../../shared/components/Text';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { EarningsBreakdown } from '../../../core/api/services/EarningsService';
import { formatCurrency, formatPercentage } from '../../../shared/utils/formatting';

export interface EarningsBreakdownCardProps {
  /**
   * Earnings breakdown data
   */
  data: EarningsBreakdown[];

  /**
   * Loading state
   */
  loading?: boolean;
}

export const EarningsBreakdownCard: React.FC<EarningsBreakdownCardProps> = ({
  data,
  loading,
}) => {
  const { theme } = useTheme();

  if (loading) {
    return (
      <Card elevation="sm" padding="md">
        <Text variant="h6" style={styles.title}>
          Earnings by Category
        </Text>
        <View style={styles.loadingContainer}>
          <Text variant="body" color="textSecondary">
            Loading breakdown...
          </Text>
        </View>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card elevation="sm" padding="md">
        <Text variant="h6" style={styles.title}>
          Earnings by Category
        </Text>
        <View style={styles.emptyContainer}>
          <Text variant="body" color="textSecondary">
            No earnings data available
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card elevation="sm" padding="md">
      <Text variant="h6" style={styles.title}>
        Earnings by Category
      </Text>

      <View style={styles.breakdownList}>
        {data.map((item) => (
          <View key={item.categoryId} style={styles.breakdownItem}>
            <View style={styles.breakdownHeader}>
              <View style={styles.categoryInfo}>
                <Text variant="body" style={styles.categoryName}>
                  {item.categoryName}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {item.count} {item.count === 1 ? 'service' : 'services'}
                </Text>
              </View>
              <View style={styles.amountInfo}>
                <Text variant="body" style={styles.amount}>
                  {formatCurrency(item.amount)}
                </Text>
                <Text variant="caption" color="textSecondary">
                  {formatPercentage(item.percentage / 100)}
                </Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${item.percentage}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: spacing.lg,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  breakdownList: {
    gap: spacing.lg,
  },
  breakdownItem: {
    gap: spacing.sm,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  categoryInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  categoryName: {
    fontWeight: '600',
  },
  amountInfo: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  amount: {
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
