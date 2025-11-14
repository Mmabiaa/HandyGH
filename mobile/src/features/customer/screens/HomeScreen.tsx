/**
 * Home Screen (Customer)
 *
 * Main screen for customers showing service categories,
 * featured providers, and active bookings.
 *
 * Requirements: 2.1, 2.11
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../../shared/components';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { useUserProfileStore } from '../../../core/store/userProfileStore';
import { useProviders } from '../../../core/query/hooks/useProviders';
import { useCategories } from '../../../core/query/hooks/useCategories';
import { useActiveBookings } from '../../../core/query/hooks/useBookings';
import { useFavoriteProvider, useUnfavoriteProvider } from '../../../core/query/hooks/useProviders';
import { useAllBookingUpdates } from '../../../core/realtime';
import { useQueryClient } from '@tanstack/react-query';
import type { CustomerStackParamList } from '../../../core/navigation/types';
import { CategoryGrid, FeaturedProviders, ActiveBookings } from '../components';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'Home'>;

/**
 * Loading Skeleton Component
 * Displays placeholder content while data is loading
 */
const LoadingSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={styles.skeletonContainer} testID="loading-skeleton">
      {/* Greeting skeleton */}
      <View
        style={[
          styles.skeletonBox,
          { width: 200, height: 32, backgroundColor: theme.colors.neutral[200] },
        ]}
      />
      <View
        style={[
          styles.skeletonBox,
          { width: 150, height: 20, backgroundColor: theme.colors.neutral[200], marginTop: spacing.xs },
        ]}
      />

      {/* Search bar skeleton */}
      <View
        style={[
          styles.skeletonBox,
          { width: '100%', height: 48, backgroundColor: theme.colors.neutral[200], marginTop: spacing.lg },
        ]}
      />

      {/* Categories skeleton */}
      <View style={styles.skeletonGrid}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.skeletonBox,
              { width: (width - spacing.lg * 3) / 2, height: 100, backgroundColor: theme.colors.neutral[200] },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

/**
 * Home Screen Component
 */
const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const customerProfile = useUserProfileStore((state) => state.customerProfile);
  const isFavoriteProvider = useUserProfileStore((state) => state.isFavoriteProvider);
  const addFavoriteProvider = useUserProfileStore((state) => state.addFavoriteProvider);
  const removeFavoriteProvider = useUserProfileStore((state) => state.removeFavoriteProvider);

  // Subscribe to real-time booking updates
  useAllBookingUpdates();

  // State
  const [refreshing, setRefreshing] = useState(false);

  // Mutations
  const favoriteProviderMutation = useFavoriteProvider();
  const unfavoriteProviderMutation = useUnfavoriteProvider();

  // Data fetching
  const {
    data: providersData,
    isLoading: isLoadingProviders,
    error: providersError,
  } = useProviders({ featured: true, limit: 10 });

  const {
    data: categories,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCategories();

  const {
    data: activeBookings,
    isLoading: isLoadingBookings,
    error: bookingsError,
  } = useActiveBookings();

  // Computed values
  const isLoading = isLoadingProviders || isLoadingCategories || isLoadingBookings;
  const hasError = providersError || categoriesError || bookingsError;
  const featuredProviders = providersData?.results || [];

  // Get greeting based on time of day
  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries();
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  // Handle search bar press
  const handleSearchPress = useCallback(() => {
    navigation.navigate('Search', {});
  }, [navigation]);

  // Handle category press
  const handleCategoryPress = useCallback(
    (categoryId: string, categoryName: string) => {
      navigation.navigate('ProviderList', { categoryId, categoryName });
    },
    [navigation]
  );

  // Handle provider press
  const handleProviderPress = useCallback(
    (providerId: string) => {
      navigation.navigate('ProviderDetail', { providerId });
    },
    [navigation]
  );

  // Handle favorite toggle
  const handleFavoritePress = useCallback(
    async (providerId: string) => {
      const isFavorite = isFavoriteProvider(providerId);

      if (isFavorite) {
        removeFavoriteProvider(providerId);
        await unfavoriteProviderMutation.mutateAsync(providerId);
      } else {
        addFavoriteProvider(providerId);
        await favoriteProviderMutation.mutateAsync(providerId);
      }
    },
    [
      isFavoriteProvider,
      addFavoriteProvider,
      removeFavoriteProvider,
      favoriteProviderMutation,
      unfavoriteProviderMutation,
    ]
  );

  // Get favorite provider IDs
  const favoriteProviderIds = customerProfile?.favoriteProviders || [];

  // Handle booking press
  const handleBookingPress = useCallback(
    (bookingId: string) => {
      navigation.navigate('BookingDetails', { bookingId });
    },
    [navigation]
  );

  // Handle view all bookings
  const handleViewAllBookings = useCallback(() => {
    navigation.navigate('BookingList');
  }, [navigation]);

  // Render loading state
  if (isLoading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSkeleton />
      </View>
    );
  }

  // Render error state
  if (hasError && !refreshing) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text variant="h6" color="error" align="center">
          Unable to load content
        </Text>
        <Text variant="body" color="textSecondary" align="center" style={{ marginTop: spacing.sm }}>
          Please check your connection and try again
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Personalized Greeting */}
        <View style={styles.header}>
          <Text variant="h4" color="text" accessibilityRole="header">
            {getGreeting()}{customerProfile?.firstName ? `, ${customerProfile.firstName}` : ''}
          </Text>
          {customerProfile?.defaultLocation && (
            <Text variant="body" color="textSecondary" style={{ marginTop: spacing.xs }}>
              📍 {customerProfile.defaultLocation.city || 'Accra'}
            </Text>
          )}
        </View>

        {/* Search Bar Placeholder */}
        <View
          style={[styles.searchBar, { backgroundColor: theme.colors.neutral[100] }]}
          accessibilityRole="button"
          accessibilityLabel="Search for services or providers"
          onTouchEnd={handleSearchPress}
        >
          <Text variant="body" color="textSecondary">
            🔍 Search for services...
          </Text>
        </View>

        {/* Service Categories */}
        {categories && categories.length > 0 && (
          <CategoryGrid categories={categories} onCategoryPress={handleCategoryPress} />
        )}

        {/* Featured Providers */}
        {featuredProviders.length > 0 && (
          <FeaturedProviders
            providers={featuredProviders}
            onProviderPress={handleProviderPress}
            onFavoritePress={handleFavoritePress}
            favoriteProviderIds={favoriteProviderIds}
          />
        )}

        {/* Active Bookings */}
        {activeBookings && activeBookings.length > 0 && (
          <ActiveBookings
            bookings={activeBookings}
            onBookingPress={handleBookingPress}
            onViewAll={handleViewAllBookings}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  searchBar: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholder: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  skeletonContainer: {
    padding: spacing.lg,
  },
  skeletonBox: {
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
});

export default HomeScreen;
