/**
 * Provider Dashboard Screen
 *
 * Main screen for providers showing business metrics and overview.
 *
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.12
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Text } from '../../../shared/components/Text';
import { Button } from '../../../shared/components/Button';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { useDashboardData } from '../../../core/query/hooks/useDashboard';
import { MetricCard } from '../components/MetricCard';
import { EarningsChart } from '../components/EarningsChart';
import { UpcomingBookingCard } from '../components/UpcomingBookingCard';
import { formatCurrency } from '../../../shared/utils/formatting';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../core/query/queryKeys';

/**
 * Provider Dashboard Screen
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.12
 */
const ProviderDashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  // Requirement 8.1: Retrieve dashboard metrics
  const { data, isLoading, error, refetch } = useDashboardData();

  // Handle pull-to-refresh
  // Requirement 8.12: Implement pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: queryKeys.provider.all });
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, refetch]);

  // Quick action handlers
  const handleViewBookingRequests = () => {
    // @ts-ignore - Navigation types will be properly defined when navigation is set up
    navigation.navigate('BookingRequests');
  };

  const handleViewCalendar = () => {
    // @ts-ignore - Navigation types will be properly defined when navigation is set up
    navigation.navigate('ProviderCalendar');
  };

  const handleViewEarnings = () => {
    // @ts-ignore - Navigation types will be properly defined when navigation is set up
    navigation.navigate('Earnings');
  };

  const handleBookingPress = (bookingId: string) => {
    // @ts-ignore - Navigation types will be properly defined when navigation is set up
    navigation.navigate('BookingDetails', { bookingId });
  };

  // Loading state
  if (isLoading && !data) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="body" color="textSecondary" style={styles.loadingText}>
          Loading dashboard...
        </Text>
      </View>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text variant="h6" style={styles.errorTitle}>
          Unable to load dashboard
        </Text>
        <Text variant="body" color="textSecondary" style={styles.errorMessage}>
          Please check your connection and try again
        </Text>
        <Button onPress={() => refetch()} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  const metrics = data?.metrics;
  const earningsTrend = data?.earningsTrend || [];
  const upcomingBookings = data?.upcomingBookings || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h4" style={styles.title}>
          Dashboard
        </Text>
        <Text variant="body" color="textSecondary">
          Your business overview
        </Text>
      </View>

      {/* Key Metrics */}
      {/* Requirements: 8.2, 8.3, 8.4 - Display key business metrics */}
      <View style={styles.section}>
        <Text variant="h6" style={styles.sectionTitle}>
          Key Metrics
        </Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Earnings"
            value={formatCurrency(metrics?.totalEarnings || 0)}
            subtitle="This month"
            onPress={handleViewEarnings}
          />
          <MetricCard
            title="Active Bookings"
            value={metrics?.activeBookingsCount || 0}
            subtitle="In progress"
          />
        </View>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Pending Requests"
            value={metrics?.pendingRequestsCount || 0}
            subtitle="Awaiting response"
            onPress={handleViewBookingRequests}
          />
          <MetricCard
            title="Average Rating"
            value={metrics?.averageRating?.toFixed(1) || '0.0'}
            subtitle={`${metrics?.completedServicesCount || 0} services`}
          />
        </View>
      </View>

      {/* Earnings Trend Chart */}
      {/* Requirement 8.3: Show earnings trend chart for past 30 days */}
      <View style={styles.section}>
        <EarningsChart data={earningsTrend} loading={isLoading} />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text variant="h6" style={styles.sectionTitle}>
          Quick Actions
        </Text>
        <View style={styles.quickActions}>
          <Button
            variant="outline"
            size="medium"
            onPress={handleViewBookingRequests}
            style={styles.actionButton}
          >
            View Requests
          </Button>
          <Button
            variant="outline"
            size="medium"
            onPress={handleViewCalendar}
            style={styles.actionButton}
          >
            Calendar
          </Button>
          <Button
            variant="outline"
            size="medium"
            onPress={handleViewEarnings}
            style={styles.actionButton}
          >
            Earnings
          </Button>
        </View>
      </View>

      {/* Upcoming Bookings */}
      {/* Requirement 8.4: Display upcoming bookings calendar view */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="h6" style={styles.sectionTitle}>
            Upcoming Bookings
          </Text>
          <Button
            variant="ghost"
            size="small"
            onPress={handleViewCalendar}
          >
            View All
          </Button>
        </View>

        {upcomingBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="body" color="textSecondary">
              No upcoming bookings
            </Text>
            <Text variant="caption" color="textSecondary" style={styles.emptySubtext}>
              New bookings will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {upcomingBookings.slice(0, 3).map((booking) => (
              <UpcomingBookingCard
                key={booking.id}
                booking={booking}
                onPress={() => handleBookingPress(booking.id)}
              />
            ))}
            {upcomingBookings.length > 3 && (
              <Button
                variant="outline"
                size="medium"
                onPress={handleViewCalendar}
                style={styles.viewMoreButton}
              >
                View {upcomingBookings.length - 3} More
              </Button>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.xs,
  },
  loadingText: {
    marginTop: spacing.md,
  },
  errorTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 120,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
  bookingsList: {
    gap: spacing.md,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  emptySubtext: {
    marginTop: spacing.xs,
  },
  viewMoreButton: {
    marginTop: spacing.sm,
  },
});

export default ProviderDashboardScreen;
