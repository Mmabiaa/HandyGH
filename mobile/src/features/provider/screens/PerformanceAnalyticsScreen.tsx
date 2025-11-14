/**
 * Performance Analytics Screen
 *
 * Displays KPIs, period-over-period comparison, and performance trend visualizations.
 *
 * Requirements: 10.7, 10.8
 */

import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text } from '../../../shared/components/Text';
import { spacing } from '../../../core/theme/spacing';
import { usePerformanceMetrics, usePerformanceTrend } from '../hooks/usePerformance';
import { KPICard } from '../components/KPICard';
import { PerformanceTrendChart } from '../components/PerformanceTrendChart';
import { formatPercentage, formatRating } from '../../../shared/utils/formatting';

const PerformanceAnalyticsScreen: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics, isRefetching: metricsRefetching } = usePerformanceMetrics();
  const { data: trend, isLoading: trendLoading, refetch: refetchTrend } = usePerformanceTrend(30);

  const handleRefresh = () => {
    refetchMetrics();
    refetchTrend();
  };

  // Calculate change percentages
  const acceptanceRateChange = metrics
    ? ((metrics.bookingAcceptanceRate - metrics.comparisonPeriod.bookingAcceptanceRate) /
        metrics.comparisonPeriod.bookingAcceptanceRate) *
      100
    : undefined;

  const ratingChange = metrics
    ? ((metrics.averageRating - metrics.comparisonPeriod.averageRating) /
        metrics.comparisonPeriod.averageRating) *
      100
    : undefined;

  const responseTimeChange = metrics
    ? ((metrics.comparisonPeriod.averageResponseTime - metrics.averageResponseTime) /
        metrics.comparisonPeriod.averageResponseTime) *
      100
    : undefined; // Inverted: lower is better

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={metricsRefetching} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h4" style={styles.title}>
            Performance Analytics
          </Text>
          <Text variant="body" color="textSecondary">
            Track your key performance indicators
          </Text>
        </View>

        {/* KPI Cards */}
        <View style={styles.kpiSection}>
          <Text variant="h6" style={styles.sectionTitle}>
            Key Metrics
          </Text>

          <View style={styles.kpiGrid}>
            <KPICard
              title="Acceptance Rate"
              value={formatPercentage(metrics?.bookingAcceptanceRate || 0)}
              previousValue={formatPercentage(
                metrics?.comparisonPeriod.bookingAcceptanceRate || 0
              )}
              changePercentage={acceptanceRateChange}
              loading={metricsLoading}
            />

            <KPICard
              title="Average Rating"
              value={formatRating(metrics?.averageRating || 0)}
              previousValue={formatRating(metrics?.comparisonPeriod.averageRating || 0)}
              changePercentage={ratingChange}
              loading={metricsLoading}
            />
          </View>

          <View style={styles.kpiGrid}>
            <KPICard
              title="Response Time"
              value={`${Math.round(metrics?.averageResponseTime || 0)} min`}
              previousValue={`${Math.round(
                metrics?.comparisonPeriod.averageResponseTime || 0
              )} min`}
              changePercentage={responseTimeChange}
              loading={metricsLoading}
            />

            <KPICard
              title="Total Services"
              value={metrics?.totalServices.toString() || '0'}
              loading={metricsLoading}
            />
          </View>

          <View style={styles.kpiGrid}>
            <KPICard
              title="Repeat Customers"
              value={formatPercentage(metrics?.repeatCustomerRate || 0)}
              loading={metricsLoading}
            />
          </View>
        </View>

        {/* Performance Trend Chart */}
        <View style={styles.chartSection}>
          <PerformanceTrendChart data={trend || []} loading={trendLoading} />
        </View>

        {/* Insights */}
        {metrics && !metricsLoading && (
          <View style={styles.insightsSection}>
            <Text variant="h6" style={styles.sectionTitle}>
              Insights
            </Text>

            {acceptanceRateChange !== undefined && acceptanceRateChange > 0 && (
              <View style={styles.insightCard}>
                <Text variant="body">
                  🎉 Your acceptance rate improved by{' '}
                  <Text style={styles.highlight}>
                    {Math.abs(acceptanceRateChange).toFixed(1)}%
                  </Text>{' '}
                  compared to last period!
                </Text>
              </View>
            )}

            {ratingChange !== undefined && ratingChange > 0 && (
              <View style={styles.insightCard}>
                <Text variant="body">
                  ⭐ Your rating increased by{' '}
                  <Text style={styles.highlight}>
                    {Math.abs(ratingChange).toFixed(1)}%
                  </Text>
                  . Keep up the great work!
                </Text>
              </View>
            )}

            {responseTimeChange !== undefined && responseTimeChange > 0 && (
              <View style={styles.insightCard}>
                <Text variant="body">
                  ⚡ You're responding{' '}
                  <Text style={styles.highlight}>
                    {Math.abs(responseTimeChange).toFixed(1)}%
                  </Text>{' '}
                  faster than before!
                </Text>
              </View>
            )}

            {metrics.repeatCustomerRate > 0.3 && (
              <View style={styles.insightCard}>
                <Text variant="body">
                  💪 {formatPercentage(metrics.repeatCustomerRate)} of your customers are
                  repeat clients. Great customer retention!
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  kpiSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  chartSection: {
    marginBottom: spacing.lg,
  },
  insightsSection: {
    marginBottom: spacing.lg,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default PerformanceAnalyticsScreen;
