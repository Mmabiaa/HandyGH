/**
 * Earnings Screen
 *
 * Displays earnings analytics and financial data.
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text } from '../../../shared/components/Text';
import { spacing } from '../../../core/theme/spacing';
import { useEarnings } from '../hooks/useEarnings';
import {
  EarningsSummaryCard,
  EarningsBreakdownCard,
  EarningsChart,
  PeriodFilter,
} from '../components';
import type { Period } from '../components/PeriodFilter';

const EarningsScreen: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  const { data, isLoading, refetch, isRefetching } = useEarnings(selectedPeriod);

  const handleRefresh = () => {
    refetch();
  };

  const handlePeriodChange = (period: Period) => {
    setSelectedPeriod(period);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="h4" style={styles.title}>
            Earnings
          </Text>
          <Text variant="body" color="textSecondary">
            Track your financial performance
          </Text>
        </View>

        {/* Period Filter */}
        <View style={styles.filterContainer}>
          <PeriodFilter
            selectedPeriod={selectedPeriod}
            onPeriodChange={handlePeriodChange}
          />
        </View>

        {/* Earnings Summary */}
        <EarningsSummaryCard
          totalEarnings={data?.totalEarnings || 0}
          pendingPayments={data?.pendingPayments || 0}
          completedPayments={data?.completedPayments || 0}
          loading={isLoading}
        />

        {/* Earnings Trend Chart */}
        <EarningsChart data={data?.trend || []} loading={isLoading} />

        {/* Earnings Breakdown by Category */}
        <EarningsBreakdownCard data={data?.breakdown || []} loading={isLoading} />
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
  filterContainer: {
    marginBottom: spacing.lg,
  },
});

export default EarningsScreen;
