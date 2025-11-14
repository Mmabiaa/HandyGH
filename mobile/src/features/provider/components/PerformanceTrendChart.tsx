/**
 * Performance Trend Chart Component
 * Displays performance metrics trend over time
 *
 * Requirements: 10.8
 */

import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Card } from '../../../shared/components/Card';
import { Text } from '../../../shared/components/Text';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { PerformanceTrend } from '../../../core/api/services/PerformanceService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 4;
const CHART_HEIGHT = 200;
const CHART_PADDING = spacing.md;

type MetricType = 'acceptanceRate' | 'rating' | 'responseTime';

export interface PerformanceTrendChartProps {
  /**
   * Performance trend data
   */
  data: PerformanceTrend[];

  /**
   * Loading state
   */
  loading?: boolean;
}

const METRIC_OPTIONS: { value: MetricType; label: string; unit: string }[] = [
  { value: 'acceptanceRate', label: 'Acceptance Rate', unit: '%' },
  { value: 'rating', label: 'Rating', unit: '' },
  { value: 'responseTime', label: 'Response Time', unit: ' min' },
];

export const PerformanceTrendChart: React.FC<PerformanceTrendChartProps> = ({
  data,
  loading,
}) => {
  const { theme } = useTheme();
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('acceptanceRate');

  // Calculate chart dimensions and data points
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const values = data.map((d) => {
      switch (selectedMetric) {
        case 'acceptanceRate':
          return d.acceptanceRate * 100;
        case 'rating':
          return d.rating;
        case 'responseTime':
          return d.responseTime;
        default:
          return 0;
      }
    });

    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * (CHART_WIDTH - CHART_PADDING * 2);
      const value = values[index];
      const normalizedValue = (value - minValue) / range;
      const y = CHART_HEIGHT - CHART_PADDING - normalizedValue * (CHART_HEIGHT - CHART_PADDING * 2);

      return { x, y, value, date: item.date };
    });

    return { points, maxValue, minValue, average: values.reduce((a, b) => a + b, 0) / values.length };
  }, [data, selectedMetric]);

  const getMetricUnit = () => {
    return METRIC_OPTIONS.find((m) => m.value === selectedMetric)?.unit || '';
  };

  if (loading) {
    return (
      <Card elevation="sm" padding="md">
        <Text variant="h6" style={styles.title}>
          Performance Trend
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
          Performance Trend
        </Text>
        <View style={[styles.chartContainer, styles.emptyContainer]}>
          <Text variant="body" color="textSecondary">
            No performance data available
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card elevation="sm" padding="md">
      <View style={styles.header}>
        <View>
          <Text variant="h6" style={styles.title}>
            Performance Trend
          </Text>
          <Text variant="caption" color="textSecondary">
            Average: {chartData.average.toFixed(selectedMetric === 'rating' ? 1 : 0)}
            {getMetricUnit()}
          </Text>
        </View>
      </View>

      {/* Metric Selector */}
      <View style={styles.metricSelector}>
        {METRIC_OPTIONS.map((metric) => {
          const isSelected = selectedMetric === metric.value;
          return (
            <Pressable
              key={metric.value}
              style={[
                styles.metricButton,
                isSelected && {
                  backgroundColor: theme.colors.primary,
                },
              ]}
              onPress={() => setSelectedMetric(metric.value)}
              accessibilityRole="button"
              accessibilityLabel={`Show ${metric.label}`}
              accessibilityState={{ selected: isSelected }}
            >
              <Text
                variant="caption"
                style={[
                  styles.metricButtonText,
                  isSelected && styles.selectedMetricText,
                ]}
              >
                {metric.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.chartContainer}>
        {/* Simple line chart visualization */}
        <View style={styles.chart}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text variant="caption" color="textSecondary">
              {chartData.maxValue.toFixed(selectedMetric === 'rating' ? 1 : 0)}
              {getMetricUnit()}
            </Text>
            <Text variant="caption" color="textSecondary">
              {((chartData.maxValue + chartData.minValue) / 2).toFixed(
                selectedMetric === 'rating' ? 1 : 0
              )}
              {getMetricUnit()}
            </Text>
            <Text variant="caption" color="textSecondary">
              {chartData.minValue.toFixed(selectedMetric === 'rating' ? 1 : 0)}
              {getMetricUnit()}
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
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  metricSelector: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
    gap: 4,
    marginBottom: spacing.lg,
  },
  metricButton: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricButtonText: {
    fontWeight: '600',
    color: '#757575',
    fontSize: 11,
  },
  selectedMetricText: {
    color: '#FFFFFF',
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
