/**
 * Metric Card Component
 * Displays a single business metric with icon and value
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '../../../shared/components/Card';
import { Text } from '../../../shared/components/Text';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';

export interface MetricCardProps {
  /**
   * Metric title
   */
  title: string;

  /**
   * Metric value
   */
  value: string | number;

  /**
   * Optional subtitle or description
   */
  subtitle?: string;

  /**
   * Icon component
   */
  icon?: React.ReactNode;

  /**
   * Optional trend indicator
   */
  trend?: {
    value: number;
    isPositive: boolean;
  };

  /**
   * Press handler
   */
  onPress?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <Card
      elevation="sm"
      padding="md"
      onPress={onPress}
      style={styles.card}
      accessibilityLabel={`${title}: ${value}`}
    >
      <View style={styles.container}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.content}>
          <Text variant="caption" color="textSecondary" style={styles.title}>
            {title}
          </Text>
          <Text variant="h4" style={styles.value}>
            {value}
          </Text>
          {subtitle && (
            <Text variant="caption" color="textSecondary" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
          {trend && (
            <View style={styles.trendContainer}>
              <Text
                variant="caption"
                style={[
                  styles.trend,
                  { color: trend.isPositive ? theme.colors.success : theme.colors.error },
                ]}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: spacing.md,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: spacing.xs,
  },
  value: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  trendContainer: {
    marginTop: spacing.xs,
  },
  trend: {
    fontWeight: '600',
  },
});
