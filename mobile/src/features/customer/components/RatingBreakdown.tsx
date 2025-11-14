/**
 * Rating Breakdown Component
 *
 * Displays rating distribution with 5-star to 1-star breakdown.
 * Shows visual bars for each rating level.
 *
 * Requirements: 3.4, 7.8
 */

import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { Text } from '../../../shared/components';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';

interface RatingBreakdownProps {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

/**
 * Rating Breakdown Component
 */
export const RatingBreakdown: React.FC<RatingBreakdownProps> = ({
  average,
  total,
  distribution,
}) => {
  const { theme } = useTheme();

  const getPercentage = (count: number): number => {
    if (total === 0) return 0;
    return (count / total) * 100;
  };

  const renderRatingBar = (stars: number, count: number) => {
    const percentage = getPercentage(count);

    return (
      <View key={stars} style={styles.ratingRow}>
        <Text variant="caption" color="textSecondary" style={styles.starLabel}>
          {stars} ⭐
        </Text>

        <View style={[styles.barContainer, { backgroundColor: theme.colors.neutral[200] }]}>
          <View
            style={[
              styles.barFill,
              {
                width: `${percentage}%`,
                backgroundColor: theme.colors.warning,
              },
            ]}
          />
        </View>

        <Text variant="caption" color="textSecondary" style={styles.countLabel}>
          {count}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Overall Rating */}
      <View style={styles.overallContainer}>
        <Text variant="h2" color="text">
          {average.toFixed(1)}
        </Text>
        <View style={styles.starsContainer}>
          {Array.from({ length: 5 }, (_, index) => (
            <Text key={index} variant="h6" color={index < Math.round(average) ? 'warning' : 'textSecondary'}>
              {index < Math.round(average) ? '⭐' : '☆'}
            </Text>
          ))}
        </View>
        <Text variant="caption" color="textSecondary">
          Based on {total} {total === 1 ? 'review' : 'reviews'}
        </Text>
      </View>

      {/* Rating Distribution */}
      <View style={styles.distributionContainer}>
        {[5, 4, 3, 2, 1].map((stars) =>
          renderRatingBar(stars, distribution[stars as keyof typeof distribution])
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  overallContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
    minWidth: 100,
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
  },
  distributionContainer: {
    flex: 1,
    paddingLeft: spacing.lg,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  starLabel: {
    width: 40,
  },
  barContainer: {
    flex: 1,
    height: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  countLabel: {
    width: 30,
    textAlign: 'right',
  },
});
