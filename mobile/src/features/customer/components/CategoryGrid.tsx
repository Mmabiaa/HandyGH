/**
 * Category Grid Component
 *
 * Displays service categories in a grid layout with icons and names.
 * Includes staggered entrance animations for a polished UX.
 *
 * Requirements: 2.3, 2.5, 2.6
 */

import React, { useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Text } from '../../../shared/components';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { spacing } from '../../../core/theme/spacing';
import { borderRadius } from '../../../core/theme/borderRadius';
import { shadows } from '../../../core/theme/shadows';
import type { ServiceCategory } from '../../../core/query/hooks/useCategories';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 2;
const CARD_MARGIN = spacing.md;
const CARD_WIDTH = (width - spacing.lg * 2 - CARD_MARGIN * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

interface CategoryGridProps {
  categories: ServiceCategory[];
  onCategoryPress: (categoryId: string, categoryName: string) => void;
}

/**
 * Animated Category Card Component
 */
interface CategoryCardProps {
  category: ServiceCategory;
  index: number;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const CategoryCard: React.FC<CategoryCardProps> = ({ category, index, onPress }) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.9);

  // Staggered entrance animation
  useEffect(() => {
    const delay = index * 50; // 50ms stagger between items

    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 300 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Get icon emoji based on category name (fallback to generic icon)
  const getCategoryIcon = (name: string): string => {
    const iconMap: Record<string, string> = {
      plumbing: '🔧',
      electrical: '⚡',
      cleaning: '🧹',
      carpentry: '🔨',
      painting: '🎨',
      gardening: '🌱',
      'home repair': '🏠',
      moving: '📦',
    };

    const key = name.toLowerCase();
    return iconMap[key] || category.icon || '🛠️';
  };

  return (
    <AnimatedTouchable
      style={[
        styles.categoryCard,
        {
          backgroundColor: theme.colors.cardBackground,
          width: CARD_WIDTH,
          ...shadows.sm,
        },
        animatedStyle,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${category.name} category`}
      accessibilityHint="Tap to view providers in this category"
    >
      <View style={styles.iconContainer}>
        <Text variant="h2" style={styles.icon}>
          {getCategoryIcon(category.name)}
        </Text>
      </View>
      <Text
        variant="labelLarge"
        color="text"
        align="center"
        numberOfLines={2}
        style={styles.categoryName}
      >
        {category.name}
      </Text>
    </AnimatedTouchable>
  );
};

/**
 * Category Grid Component
 */
export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  onCategoryPress,
}) => {
  // Limit to 8 categories for the home screen
  const displayCategories = categories.slice(0, 8);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="h6" color="text" accessibilityRole="header">
          Service Categories
        </Text>
      </View>

      <View style={styles.grid}>
        {displayCategories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            index={index}
            onPress={() => onCategoryPress(category.id, category.name)}
          />
        ))}
      </View>

      {categories.length === 0 && (
        <View style={styles.emptyState}>
          <Text variant="body" color="textSecondary" align="center">
            No categories available
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: CARD_MARGIN,
  },
  categoryCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  iconContainer: {
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 40,
  },
  categoryName: {
    marginTop: spacing.xs,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
});
