/**
 * Featured Providers Component
 *
 * Displays a horizontal scrollable list of featured providers.
 * Optimized for performance with proper list rendering.
 *
 * Requirements: 2.2, 2.4, 2.9, 11.5
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Text } from '../../../shared/components';
import { spacing } from '../../../core/theme/spacing';
import { ProviderCard } from './ProviderCard';
import type { Provider } from '../../../core/api/types';

interface FeaturedProvidersProps {
  providers: Provider[];
  onProviderPress: (providerId: string) => void;
  onFavoritePress?: (providerId: string) => void;
  favoriteProviderIds?: string[];
  onViewAll?: () => void;
}

/**
 * Featured Providers Section Component
 */
export const FeaturedProviders: React.FC<FeaturedProvidersProps> = ({
  providers,
  onProviderPress,
  onFavoritePress,
  favoriteProviderIds = [],
  onViewAll,
}) => {
  if (providers.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <Text variant="h6" color="text" accessibilityRole="header">
          Featured Providers
        </Text>
        {onViewAll && (
          <TouchableOpacity
            onPress={onViewAll}
            accessibilityRole="button"
            accessibilityLabel="View all providers"
          >
            <Text variant="labelLarge" color="primary">
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Scrollable List */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToInterval={200 + spacing.md}
        snapToAlignment="start"
      >
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onPress={() => onProviderPress(provider.id)}
            onFavorite={onFavoritePress ? () => onFavoritePress(provider.id) : undefined}
            isFavorite={favoriteProviderIds.includes(provider.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
});
