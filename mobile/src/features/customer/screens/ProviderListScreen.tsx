/**
 * Provider List Screen
 *
 * Displays a list of providers filtered by category with infinite scroll pagination.
 * Includes sort options for rating, distance, and price.
 *
 * Requirements: 2.6, 11.5
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Text } from '../../../shared/components';
import { ProviderCard } from '../components/ProviderCard';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ProviderService } from '../../../core/api/services/ProviderService';
import { queryKeys } from '../../../core/query/queryKeys';
import type { CustomerStackParamList } from '../../../core/navigation/types';
import type { Provider, ProviderQueryParams } from '../../../core/api/types';

type ProviderListScreenNavigationProp = NativeStackNavigationProp<
  CustomerStackParamList,
  'ProviderList'
>;
type ProviderListScreenRouteProp = RouteProp<CustomerStackParamList, 'ProviderList'>;

type SortOption = 'rating' | 'distance' | 'price';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Provider List Screen Component
 */
export const ProviderListScreen: React.FC = () => {
  const navigation = useNavigation<ProviderListScreenNavigationProp>();
  const route = useRoute<ProviderListScreenRouteProp>();
  const { theme } = useTheme();

  const { categoryId, categoryName } = route.params;

  // Sort state
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Build query params
  const queryParams: ProviderQueryParams = {
    category: categoryId,
    pageSize: 20,
  };

  // Infinite query for pagination
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.providers.list(queryParams),
    queryFn: ({ pageParam = 1 }) =>
      ProviderService.getProviders({ ...queryParams, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // Flatten paginated data
  const providers = useMemo(() => {
    return data?.pages.flatMap(page => page.results) || [];
  }, [data]);

  // Sort providers
  const sortedProviders = useMemo(() => {
    const sorted = [...providers];

    switch (sortBy) {
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'distance':
        // Distance sorting would require location data
        // For now, just return as-is
        return sorted;
      case 'price':
        // Price sorting would require service price data
        // For now, just return as-is
        return sorted;
      default:
        return sorted;
    }
  }, [providers, sortBy]);

  const handleProviderPress = useCallback(
    (providerId: string) => {
      if (Platform.OS !== 'web') {
        ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
      }
      navigation.navigate('ProviderDetail', { providerId });
    },
    [navigation]
  );

  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option);
    setShowSortMenu(false);
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('selection', hapticOptions);
    }
  }, []);

  const toggleSortMenu = useCallback(() => {
    setShowSortMenu(prev => !prev);
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderProviderItem = useCallback(
    ({ item }: { item: Provider }) => (
      <View style={styles.providerItem}>
        <ProviderCard provider={item} onPress={() => handleProviderPress(item.id)} />
      </View>
    ),
    [handleProviderPress]
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text variant="bodySmall" color="textSecondary" style={styles.footerText}>
          Loading more...
        </Text>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="h3" color="textSecondary" style={styles.emptyText}>
        No providers found
      </Text>
      <Text variant="body" color="textSecondary" style={styles.emptySubtext}>
        There are no providers in this category yet
      </Text>
    </View>
  );

  const getSortLabel = (option: SortOption): string => {
    switch (option) {
      case 'rating':
        return '⭐ Rating';
      case 'distance':
        return '📍 Distance';
      case 'price':
        return '💰 Price';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.cardBackground }]}>
        <View style={styles.headerContent}>
          <Text variant="h3" color="text">
            {categoryName || 'Providers'}
          </Text>
          {data?.pages[0]?.count !== undefined && (
            <Text variant="bodySmall" color="textSecondary">
              {data.pages[0].count} provider{data.pages[0].count !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        {/* Sort Button */}
        <TouchableOpacity
          style={[styles.sortButton, { backgroundColor: theme.colors.neutral[100] }]}
          onPress={toggleSortMenu}
          accessibilityRole="button"
          accessibilityLabel="Sort options"
        >
          <Text variant="label" color="text">
            {getSortLabel(sortBy)}
          </Text>
          <Text variant="body" color="text">
            {showSortMenu ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sort Menu */}
      {showSortMenu && (
        <View style={[styles.sortMenu, { backgroundColor: theme.colors.cardBackground }]}>
          {(['rating', 'distance', 'price'] as SortOption[]).map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.sortOption,
                sortBy === option && { backgroundColor: theme.colors.neutral[100] },
              ]}
              onPress={() => handleSortChange(option)}
              accessibilityRole="button"
              accessibilityLabel={`Sort by ${option}`}
              accessibilityState={{ selected: sortBy === option }}
            >
              <Text
                variant="body"
                color={sortBy === option ? 'primary' : 'text'}
                style={styles.sortOptionText}
              >
                {getSortLabel(option)}
              </Text>
              {sortBy === option && (
                <Text variant="body" color="primary">
                  ✓
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Provider List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body" color="textSecondary" style={styles.loadingText}>
            Loading providers...
          </Text>
        </View>
      ) : (
        <FlashList
          data={sortedProviders}
          renderItem={renderProviderItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerContent: {
    marginBottom: spacing.sm,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  sortMenu: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  sortOptionText: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  providerItem: {
    flex: 1,
    marginBottom: spacing.md,
    marginHorizontal: spacing.xs,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    marginTop: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    textAlign: 'center',
  },
});
