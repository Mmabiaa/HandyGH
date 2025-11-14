/**
 * Favorites Screen
 *
 * Displays saved/favorited providers with ability to remove favorites.
 * Implements optimistic updates for smooth UX.
 *
 * Requirements: 3.8
 */

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '../../../shared/components';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { ProviderCard } from '../components';
import { useFavoriteProviders, useFavoriteToggle } from '../../../core/query/hooks/useFavorites';
import type { Provider } from '../../../core/api/types';

type CustomerStackParamList = {
  ProviderDetail: { providerId: string };
};

type FavoritesScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Favorites Screen Component
 */
const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const { theme } = useTheme();
  const { favoriteProviderIds, count } = useFavoriteProviders();
  const { toggleFavorite, isFavorite } = useFavoriteToggle();

  // Mock provider data (in real app, fetch from API based on favoriteProviderIds)
  const mockFavoriteProviders: Provider[] = favoriteProviderIds.map((id) => ({
    id,
    businessName: `Provider ${id.slice(-4)}`,
    businessDescription: 'Professional service provider',
    profilePhoto: 'https://via.placeholder.com/150',
    categories: ['plumbing'],
    rating: 4.5 + Math.random() * 0.5,
    totalReviews: Math.floor(Math.random() * 200) + 50,
    totalServices: Math.floor(Math.random() * 500) + 100,
    responseRate: 90 + Math.floor(Math.random() * 10),
    responseTime: 10 + Math.floor(Math.random() * 20),
    isVerified: Math.random() > 0.3,
    serviceArea: {
      type: 'radius',
      center: { latitude: 5.6037, longitude: -0.1870 },
      radius: 10,
    },
    availability: {
      schedule: {
        monday: { isAvailable: true, slots: [] },
        tuesday: { isAvailable: true, slots: [] },
        wednesday: { isAvailable: true, slots: [] },
        thursday: { isAvailable: true, slots: [] },
        friday: { isAvailable: true, slots: [] },
        saturday: { isAvailable: true, slots: [] },
        sunday: { isAvailable: false, slots: [] },
      },
      exceptions: [],
      timezone: 'GMT',
    },
  }));

  // Handlers
  const handleProviderPress = useCallback(
    (providerId: string) => {
      if (Platform.OS !== 'web') {
        ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
      }
      navigation.navigate('ProviderDetail', { providerId });
    },
    [navigation]
  );

  const handleFavoriteToggle = useCallback(
    (providerId: string) => {
      if (Platform.OS !== 'web') {
        ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
      }
      toggleFavorite(providerId);
    },
    [toggleFavorite]
  );

  const renderProvider = ({ item }: { item: Provider }) => (
    <View style={styles.providerCardContainer}>
      <ProviderCard
        provider={item}
        onPress={() => handleProviderPress(item.id)}
        onFavorite={() => handleFavoriteToggle(item.id)}
        isFavorite={isFavorite(item.id)}
      />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="h4" color="textSecondary" style={styles.emptyTitle}>
        No Favorites Yet
      </Text>
      <Text variant="body" color="textSecondary" style={styles.emptyText}>
        Start adding providers to your favorites by tapping the heart icon on their profile
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text variant="h5">My Favorites</Text>
      {count > 0 && (
        <Text variant="body" color="textSecondary">
          {count} {count === 1 ? 'provider' : 'providers'} saved
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={mockFavoriteProviders}
        renderItem={renderProvider}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  headerContainer: {
    marginBottom: spacing.lg,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  providerCardContainer: {
    width: '48%',
    marginBottom: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default FavoritesScreen;
