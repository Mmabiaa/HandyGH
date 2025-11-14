/**
 * Animated Heart Component
 *
 * Displays an animated heart icon that scales and changes color when toggled.
 * Used for favorite/unfavorite actions.
 *
 * Requirements: 3.8, 11.7
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { Text } from '../Text';

interface AnimatedHeartProps {
  isFavorite: boolean;
  size?: number;
}

/**
 * Animated Heart Component
 */
export const AnimatedHeart: React.FC<AnimatedHeartProps> = ({
  isFavorite,
  size = 24,
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isFavorite) {
      // Animate when favorited
      scale.value = withSequence(
        withSpring(1.3, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    } else {
      // Subtle animation when unfavorited
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  }, [isFavorite]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text variant="body" style={{ fontSize: size }}>
        {isFavorite ? '❤️' : '🤍'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
