/**
 * KPI Card Component
 * Displays a single key performance indicator with comparison
 *
 * Requirements: 10.7, 10.8
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../../../shared/components/Card';
import { Text } from '../../../shared/components/Text';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';

export interface KPICardProps {
  /**
   * KPI title
   */
  title: string;

  /**
   * Current value
   */
  value: string;

  /**
   * Previous period value for comparison
   */
  previousValue?: string;

  /**
   * Change percentage
   */
  changePercentage?: number;

  /**
   * Icon name (optional)
   */
  icon?: string;

  /**
   * Loading state
   */
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  previousValue,
  changePercentage,
  loading,
}) => {
  const { theme } = useTheme();

  const isPositive = changePercentage !== undefined && changePercentage >= 0;
  const changeColor = isPositive
    ? theme.colors.success || '#4CAF50'
    : theme.colors.error || '#F44336';

  if (loading) {
    return (
      <Card elevation="sm" padding="md" style={styles.card}>
        <View style={styles.loadingContainer}>
          <Text variant="caption" color="textSecondary">
            Loading...
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card elevation="sm" padding="md" style={styles.card}>
      <Text variant="caption" color="textSecondary" style={styles.title}>
        {title}
      </Text>

      <Text variant="h4" style={styles.value}>
        {value}
      </Text>

      {changePercentage !== undefined && (
        <View style={styles.changeContainer}>
          <View style={[styles.changeIndicator, { backgroundColor: changeColor }]}>
            <Text variant="caption" style={styles.changeText}>
              {isPositive ? '↑' : '↓'} {Math.abs(changePercentage).toFixed(1)}%
            </Text>
          </View>
          {previousValue && (
            <Text variant="caption" color="textSecondary">
              vs {previousValue}
            </Text>
          )}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
  },
  loadingContainer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  changeIndicator: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  changeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
