import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { triggerHaptic } from '../../utils/haptics';

interface SuccessAnimationProps {
  size?: number;
  color?: string;
  onComplete?: () => void;
}

/**
 * Success animation component with checkmark
 * Requirement 16.5: Success animations
 */
export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  size = 80,
  color = '#4caf50',
  onComplete,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Trigger haptic feedback
    triggerHaptic('success');

    // Animate in
    scale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 15 })
    );
    opacity.value = withTiming(1, { duration: 300 });

    // Call onComplete after animation
    if (onComplete) {
      setTimeout(onComplete, 1000);
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      >
        <View style={styles.checkmark}>
          <View
            style={[
              styles.checkmarkStem,
              {
                width: size * 0.15,
                height: size * 0.35,
                borderColor: '#fff',
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    transform: [{ rotate: '45deg' }],
  },
  checkmarkStem: {
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
});
