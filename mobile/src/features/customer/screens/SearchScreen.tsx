/**
 * Search Screen
 *
 * Allows customers to search for providers with filters for category, rating, and price range.
 * Implements debounced search with API integration.
 *
 * Requirements: 2.7, 2.8
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Text } from '../../../shared/components';
import { ProviderCard } from '../components/ProviderCard';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import { useProviders } from '../../../core/query/hooks/useProviders';
import { useCategories } from '../../../core/query/hooks/useCategories';
import type { CustomerStackParamList } from '../../../core/navigation/types';
import type { Provider, ProviderQueryParams } from '../../../core/api/types';

type SearchScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'Search'>;
type SearchScreenRouteProp = RouteProp<CustomerStackParamList, 'Search'>;

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Search Screen Component
 */
export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const route = useRoute<SearchScreenRouteProp>();
  const { theme } = useTheme();
  const { data: categories } = useCategories();

  // Search state
  const [searchQuery, setSearchQuery] = useState(route.params?.initialQuery || '');
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [minRating, setMinRating] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState<{ min?: number; max?: number }>({});

  // Build query params
  const queryParams: ProviderQueryParams = {
    search: debouncedQuery || undefined,
    category: selectedCategory,
    minRating,
    pageSize: 20,
  };

  // Fetch providers with filters
  const { data, isLoading, isFetching } = useProviders(queryParams);

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleProviderPress = useCallback(
    (providerId: string) => {
      if (Platform.OS !== 'web') {
        ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
      }
      navigation.navigate('ProviderDetail', { providerId });
    },
    [navigation]
  );

  const handleCategoryFilter = useCallback((categoryId: string) => {
    setSelectedCategory(prev => (prev === categoryId ? undefined : categoryId));
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('selection', hapticOptions);
    }
  }, []);

  const handleRatingFilter = useCallback((rating: number) => {
    setMinRating(prev => (prev === rating ? undefined : rating));
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('selection', hapticOptions);
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory(undefined);
    setMinRating(undefined);
    setPriceRange({});
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }
  }, []);

  const hasActiveFilters = selectedCategory || minRating || priceRange.min || priceRange.max;

  const renderProviderItem = useCallback(
    ({ item }: { item: Provider }) => (
      <View style={styles.providerItem}>
        <ProviderCard provider={item} onPress={() => handleProviderPress(item.id)} />
      </View>
    ),
    [handleProviderPress]
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text variant="h3" color="textSecondary" style={styles.emptyText}>
        {debouncedQuery ? 'No providers found' : 'Start searching for providers'}
      </Text>
      <Text variant="body" color="textSecondary" style={styles.emptySubtext}>
        {debouncedQuery
          ? 'Try adjusting your search or filters'
          : 'Enter a search term or browse by category'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.cardBackground }]}>
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: theme.colors.neutral[100],
                color: theme.colors.text,
              },
            ]}
            placeholder="Search providers..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
            accessibilityLabel="Search input"
            accessibilityHint="Enter search term to find providers"
          />
          {isFetching && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={styles.searchLoader}
            />
          )}
        </View>

        {/* Filter Toggle Button */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: hasActiveFilters ? theme.colors.primary : theme.colors.neutral[100],
            },
          ]}
          onPress={toggleFilters}
          accessibilityRole="button"
          accessibilityLabel="Toggle filters"
        >
          <Text
            variant="label"
            color={hasActiveFilters ? 'textOnPrimary' : 'text'}
          >
            🔍 Filters
          </Text>
          {hasActiveFilters && (
            <View style={[styles.filterBadge, { backgroundColor: theme.colors.error }]}>
              <Text variant="caption" color="textOnPrimary" style={styles.filterBadgeText}>
                {[selectedCategory, minRating, priceRange.min].filter(Boolean).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <ScrollView
          style={[styles.filtersPanel, { backgroundColor: theme.colors.cardBackground }]}
          horizontal={false}
        >
          {/* Category Filter */}
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text variant="labelLarge" color="text">
                Category
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.filterChips}>
                {categories?.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor:
                          selectedCategory === category.id
                            ? theme.colors.primary
                            : theme.colors.neutral[100],
                      },
                    ]}
                    onPress={() => handleCategoryFilter(category.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by ${category.name}`}
                    accessibilityState={{ selected: selectedCategory === category.id }}
                  >
                    <Text
                      variant="bodySmall"
                      color={selectedCategory === category.id ? 'textOnPrimary' : 'text'}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Rating Filter */}
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text variant="labelLarge" color="text">
                Minimum Rating
              </Text>
            </View>
            <View style={styles.filterChips}>
              {[5, 4, 3].map(rating => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor:
                        minRating === rating ? theme.colors.primary : theme.colors.neutral[100],
                    },
                  ]}
                  onPress={() => handleRatingFilter(rating)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${rating} stars and above`}
                  accessibilityState={{ selected: minRating === rating }}
                >
                  <Text
                    variant="bodySmall"
                    color={minRating === rating ? 'textOnPrimary' : 'text'}
                  >
                    ⭐ {rating}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: theme.colors.error }]}
              onPress={handleClearFilters}
              accessibilityRole="button"
              accessibilityLabel="Clear all filters"
            >
              <Text variant="label" color="textOnPrimary">
                Clear Filters
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      {/* Results */}
      <View style={styles.resultsContainer}>
        {data?.results && data.results.length > 0 && (
          <Text variant="bodySmall" color="textSecondary" style={styles.resultsCount}>
            {data.count} provider{data.count !== 1 ? 's' : ''} found
          </Text>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="body" color="textSecondary" style={styles.loadingText}>
              Searching...
            </Text>
          </View>
        ) : (
          <FlatList
            data={data?.results || []}
            renderItem={renderProviderItem}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    position: 'relative',
  },
  searchInput: {
    height: 48,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  searchLoader: {
    position: 'absolute',
    right: spacing.md,
    top: 12,
  },
  filterButton: {
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  filtersPanel: {
    maxHeight: 200,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  filterSection: {
    marginBottom: spacing.md,
  },
  filterHeader: {
    marginBottom: spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  clearButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  resultsCount: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  providerItem: {
    flex: 1,
    maxWidth: '48%',
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
