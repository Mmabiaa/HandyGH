/**
 * Provider Reviews Screen
 *
 * Displays full list of provider reviews with infinite scroll pagination.
 * Includes rating summary and sorting options.
 *
 * Requirements: 7.7, 7.8, 7.9
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../../shared/components';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import { shadows } from '../../../core/theme/shadows';
import { ReviewCard, RatingBreakdown } from '../components';
import { useProviderReviews, useProviderRatingBreakdown } from '../../../core/query/hooks/useReviews';
import type { Review, PaginatedResponse } from '../../../core/api/types';
import type { InfiniteData } from '@tanstack/react-query';

type CustomerStackParamList = {
  ProviderReviews: { providerId: string };
};

type ProviderReviewsScreenRouteProp = RouteProp<CustomerStackParamList, 'ProviderReviews'>;
type ProviderReviewsScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

type SortOption = 'recent' | 'highest' | 'lowest';

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Provider Reviews Screen Component
 */
export const ProviderReviewsScreen: React.FC = () => {
  const navigation = useNavigation<ProviderReviewsScreenNavigationProp>();
  const route = useRoute<ProviderReviewsScreenRouteProp>();
  const { theme } = useTheme();
  const { providerId } = route.params;

  // State
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Fetch reviews and rating breakdown
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useProviderReviews(providerId, { sortBy, pageSize: 10 });

  const {
    data: ratingBreakdown,
    isLoading: isLoadingBreakdown,
  } = useProviderRatingBreakdown(providerId);

  // Flatten paginated results from infinite query
  const infiniteData = reviewsData as InfiniteData<PaginatedResponse<Review>> | undefined;
  const reviews = infiniteData?.pages ? infiniteData.pages.flatMap((page) => page.results) : [];
  const isLoading = isLoadingReviews || isLoadingBreakdown;

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  // Handlers
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSortChange = useCallback((option: SortOption) => {
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }
    setSortBy(option);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage) return;
    fetchNextPage();
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  const renderSortButton = (option: SortOption, label: string) => {
    const isSelected = sortBy === option;

    return (
      <TouchableOpacity
        key={option}
        style={[
          styles.sortButton,
          {
            backgroundColor: isSelected ? theme.colors.primary : theme.colors.cardBackground,
            borderColor: isSelected ? theme.colors.primary : theme.colors.neutral[300],
          },
        ]}
        onPress={() => handleSortChange(option)}
        accessibilityRole="button"
        accessibilityLabel={`Sort by ${label}`}
        accessibilityState={{ selected: isSelected }}
      >
        <Text
          variant="caption"
          color={isSelected ? 'textOnPrimary' : 'text'}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      {/* Rating Summary */}
      {ratingBreakdown && (
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.cardBackground }]}>
          <RatingBreakdown
            average={ratingBreakdown.average}
            total={ratingBreakdown.total}
            distribution={ratingBreakdown.distribution}
          />
        </View>
      )}

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text variant="labelLarge" style={styles.sortLabel}>
          Sort by:
        </Text>
        <View style={styles.sortButtons}>
          {renderSortButton('recent', 'Most Recent')}
          {renderSortButton('highest', 'Highest Rating')}
          {renderSortButton('lowest', 'Lowest Rating')}
        </View>
      </View>
    </View>
  );

  const renderReview = ({ item }: { item: Review }) => (
    <ReviewCard review={item} showProviderResponse={true} />
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text variant="caption" color="textSecondary" style={styles.loadingText}>
          Loading more reviews...
        </Text>
      </View>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.cardBackground, ...shadows.sm }]}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text variant="h6">←</Text>
          </TouchableOpacity>
          <Text variant="h6" style={styles.headerTitle}>
            Reviews & Ratings
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body" color="textSecondary" style={styles.loadingText}>
            Loading reviews...
          </Text>
        </View>
      </View>
    );
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="h6" color="textSecondary">
        No reviews yet
      </Text>
      <Text variant="body" color="textSecondary" style={styles.emptyText}>
        Be the first to review this provider
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.cardBackground, ...shadows.sm }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text variant="h6">←</Text>
        </TouchableOpacity>
        <Text variant="h6" style={styles.headerTitle}>
          Reviews & Ratings
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Reviews List */}
      <FlatList
        data={sortedReviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? 50 : spacing.md,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    padding: spacing.md,
  },
  summaryCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  sortContainer: {
    marginBottom: spacing.lg,
  },
  sortLabel: {
    marginBottom: spacing.sm,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sortButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  loadingText: {
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    marginTop: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
});
