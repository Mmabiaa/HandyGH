/**
 * GradientBackground Component
 *
 * Animated gradient background with continuous color shifting
 * Uses Reanimated v3 for 60fps performance
 *
 * @requirements Req 13 (Performance)
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';

/**
 * Ghana-inspired color palette for gradient animation
 */
const GRADIENT_COLORS = {
  start: '#2563EB', // Primary blue
  middle: '#3B82F6', // Lighter blue
  end: '#60A5FA', // Light blue
};

const ANIMATION_DURATION = 8000; // 8 seconds for smooth transition

export const GradientBackground: React.FC = React.memo(() => {
  const progress = useSharedValue(0);

  // Animated gradient style (worklet - runs on UI thread)
  const animatedStyle = useAnimatedStyle(() => {
    'worklet';

    const backgroundColor = interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [GRADIENT_COLORS.start, GRADIENT_COLORS.middle, GRADIENT_COLORS.end]
    );

    return {
      backgroundColor,
    };
  });

  // Start continuous gradient animation
  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: ANIMATION_DURATION,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite repeat
      true // Reverse direction
    );

    return () => {
      progress.value = 0;
    };
  }, []);

  return <Animated.View style={[styles.gradient, animatedStyle]} />;
});

GradientBackground.displayName = 'GradientBackground';

const styles = StyleSheet.create({
  gradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
});
