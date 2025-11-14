/**
 * Period Filter Component
 * Allows selection of time period (week, month, year)
 *
 * Requirements: 10.5
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from '../../../shared/components/Text';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';

export type Period = 'week' | 'month' | 'year';

export interface PeriodFilterProps {
  /**
   * Currently selected period
   */
  selectedPeriod: Period;

  /**
   * Callback when period changes
   */
  onPeriodChange: (period: Period) => void;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
];

export const PeriodFilter: React.FC<PeriodFilterProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {PERIODS.map((period) => {
        const isSelected = selectedPeriod === period.value;

        return (
          <Pressable
            key={period.value}
            style={[
              styles.button,
              isSelected && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => onPeriodChange(period.value)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${period.label}`}
            accessibilityState={{ selected: isSelected }}
          >
            <Text
              variant="body"
              style={[
                styles.buttonText,
                isSelected && styles.selectedText,
              ]}
            >
              {period.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
    gap: 4,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontWeight: '600',
    color: '#757575',
  },
  selectedText: {
    color: '#FFFFFF',
  },
});
