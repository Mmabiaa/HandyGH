/**
 * Earnings Chart Component
 * Displays earnings trend chart for the past 30 days
 *
 * Requirements: 8.3
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card } from '../../../shared/components/Card';
import { Text } from '../../../shared/components/Text';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { EarningsTrend } from '../../../core/api/services/ProviderDashboardService';
import { formatCurrency } from '../../../shared/utils/formatting';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 4;
const CHART_HEIGHT = 200;
const CHART_PADDING = spacing.md;

export interface EarningsChartProps {
  /**
   * Earnings trend data
   */
  data: EarningsTrend[];

  /**
   * Loading state
   */
  loading?: boolean;
}

export const EarningsChart: React.FC<EarningsChartProps> = ({ data, loading }) => {
  const { theme } = useTheme();

  // Calculate chart dimensions and data points
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const maxAmount = Math.max(...data.map(d => d.amount));
    const minAmount = Math.min(...data.map(d => d.amount));
    const range = maxAmount - minAmount || 1;

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * (CHART_WIDTH - CHART_PADDING * 2);
      const normalizedValue = (item.amount - minAmount) / range;
      const y = CHART_HEIGHT - CHART_PADDING - normalizedValue * (CHART_HEIGHT - CHART_PADDING * 2);

      return { x, y, amount: item.amount, date: item.date };
    });

    return { points, maxAmount, minAmount };
  }, [data]);

  if (loading) {
    return (
      <Card elevation="sm" padding="md">
        <Text variant="h6" style={styles.title}>
          Earnings Trend (30 Days)
        </Text>
        <View style={[styles.chartContainer, styles.loadingContainer]}>
          <Text variant="body" color="textSecondary">
            Loading chart...
          </Text>
        </View>
      </Card>
    );
  }

  if (!chartData || chartData.points.length === 0) {
    return (
      <Card elevation="sm" padding="md">
        <Text variant="h6" style={styles.title}>
          Earnings Trend (30 Days)
        </Text>
        <View style={[styles.chartContainer, styles.emptyContainer]}>
          <Text variant="body" color="textSecondary">
            No earnings data available
          </Text>
        </View>
      </Card>
    );
  }

  const totalEarnings = data.reduce((sum, item) => sum + item.amount, 0);
  const averageEarnings = totalEarnings / data.length;

  return (
    <Card elevation="sm" padding="md">
      <View style={styles.header}>
        <View>
          <Text variant="h6" style={styles.title}>
            Earnings Trend (30 Days)
          </Text>
          <Text variant="caption" color="textSecondary">
            Total: {formatCurrency(totalEarnings)} • Avg: {formatCurrency(averageEarnings)}
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {/* Simple line chart visualization using View components */}
        <View style={styles.chart}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text variant="caption" color="textSecondary">
              {formatCurrency(chartData.maxAmount)}
            </Text>
            <Text variant="caption" color="textSecondary">
              {formatCurrency((chartData.maxAmount + chartData.minAmount) / 2)}
            </Text>
            <Text variant="caption" color="textSecondary">
              {formatCurrency(chartData.minAmount)}
            </Text>
          </View>

          {/* Chart area */}
          <View style={styles.chartArea}>
            {/* Grid lines */}
            <View style={[styles.gridLine, { top: 0 }]} />
            <View style={[styles.gridLine, { top: '50%' }]} />
            <View style={[styles.gridLine, { bottom: 0 }]} />

            {/* Data points and line */}
            {chartData.points.map((point, index) => (
              <View
                key={index}
                style={[
                  styles.dataPoint,
                  {
                    left: CHART_PADDING + point.x,
                    top: point.y,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            ))}

            {/* Connecting lines */}
            {chartData.points.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = chartData.points[index - 1];
              const lineWidth = Math.sqrt(
                Math.pow(point.x - prevPoint.x, 2) + Math.pow(point.y - prevPoint.y, 2)
              );
              const angle = Math.atan2(point.y - prevPoint.y, point.x - prevPoint.x);

              return (
                <View
                  key={`line-${index}`}
                  style={[
                    styles.line,
                    {
                      left: CHART_PADDING + prevPoint.x,
                      top: prevPoint.y,
                      width: lineWidth,
                      transform: [{ rotate: `${angle}rad` }],
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        {/* X-axis labels */}
        <View style={styles.xAxis}>
          <Text variant="caption" color="textSecondary">
            {data[0]?.date.split('-').slice(1).join('/')}
          </Text>
          <Text variant="caption" color="textSecondary">
            {data[Math.floor(data.length / 2)]?.date.split('-').slice(1).join('/')}
          </Text>
          <Text variant="caption" color="textSecondary">
            {data[data.length - 1]?.date.split('-').slice(1).join('/')}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  chartContainer: {
    height: CHART_HEIGHT + 40,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  chart: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
  },
  yAxis: {
    width: 60,
    justifyContent: 'space-between',
    paddingRight: spacing.sm,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: -4,
    marginTop: -4,
  },
  line: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingLeft: 60,
  },
});
