/**
 * Provider Card Component
 *
 * Displays provider information including photo, name, rating, and verification badge.
 * Used in featured providers list and search results.
 *
 * Requirements: 2.2, 2.4, 2.9
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Text, AnimatedHeart } from '../../../shared/components';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import { shadows } from '../../../core/theme/shadows';
import type { Provider } from '../../../core/api/types';

interface ProviderCardProps {
  provider: Provider;
  onPress: () => void;
  onFavorite?: () => void;
  isFavorite?: boolean;
  showDistance?: boolean;
  distance?: number;
}

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Provider Card Component
 */
export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onPress,
  onFavorite,
  isFavorite = false,
  showDistance = false,
  distance,
}) => {
  const { theme } = useTheme();

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    }
    onPress();
  };

  const handleFavoritePress = () => {
    if (Platform.OS !== 'web') {
      ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    }
    onFavorite?.();
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.cardBackground,
          ...shadows.md,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="View provider details"
      accessibilityHint={`View details for ${provider.businessName}`}
    >
      {/* Provider Image */}
      <View style={styles.imageContainer}>
        {provider.profilePhoto ? (
          <Image
            source={{ uri: provider.profilePhoto }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.neutral[200] }]}>
            <Text variant="h4" color="textSecondary">
              {provider.businessName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Verification Badge */}
        {provider.isVerified && (
          <View style={[styles.verificationBadge, { backgroundColor: theme.colors.success }]}>
            <Text variant="caption" color="textOnPrimary" style={styles.badgeText}>
              ✓
            </Text>
          </View>
        )}

        {/* Favorite Button */}
        {onFavorite && (
          <TouchableOpacity
            style={[styles.favoriteButton, { backgroundColor: 'rgba(255, 255, 255, 0.9)' }]}
            onPress={handleFavoritePress}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <AnimatedHeart isFavorite={isFavorite} size={18} />
          </TouchableOpacity>
        )}
      </View>

      {/* Provider Info */}
      <View style={styles.infoContainer}>
        <Text variant="labelLarge" color="text" numberOfLines={1}>
          {provider.businessName}
        </Text>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Text variant="body" color="warning">
            ⭐
          </Text>
          <Text variant="bodySmall" color="text" style={styles.ratingText}>
            {provider.rating.toFixed(1)}
          </Text>
          <Text variant="caption" color="textSecondary">
            ({provider.totalReviews})
          </Text>
        </View>

        {/* Distance (if available) */}
        {showDistance && distance !== undefined && (
          <Text variant="caption" color="textSecondary" style={styles.distance}>
            📍 {distance.toFixed(1)} km away
          </Text>
        )}

        {/* Service Stats */}
        <View style={styles.statsContainer}>
          <Text variant="caption" color="textSecondary">
            {provider.totalServices} services completed
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    width: 200,
    marginRight: spacing.md,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    borderRadius: borderRadius.full,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  favoriteButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: borderRadius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    padding: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  ratingText: {
    marginLeft: spacing.xs,
    marginRight: spacing.xs,
  },
  distance: {
    marginTop: spacing.xs,
  },
  statsContainer: {
    marginTop: spacing.xs,
  },
});
