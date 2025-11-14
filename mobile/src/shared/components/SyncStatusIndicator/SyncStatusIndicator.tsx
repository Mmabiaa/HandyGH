import React, { useEffect } from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '../Text';
import { spacing } from '../../../core/theme';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

interface SyncStatusIndicatorProps {
  /**
   * Whether to show the indicator
   */
  visible?: boolean;
}

/**
 * Indicator component that shows sync status
 * Displays when offline actions are being synced
 */
export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  visible: visibleProp,
}) => {
  const { isSyncing, queueSize } = useOfflineQueue();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const visible = visibleProp !== undefined ? visibleProp : isSyncing;

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSequence(
        withTiming(1, { duration: 300 }),
        withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1000 }),
            withTiming(1, { duration: 1000 })
          ),
          -1,
          true
        )
      );
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(0.8, { duration: 300 });
    }
  }, [visible, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  if (!visible && !isSyncing) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ActivityIndicator size="small" color="#FFC107" />
      <Text variant="bodySmall" style={styles.text}>
        {queueSize > 0
          ? `Syncing ${queueSize} ${queueSize === 1 ? 'action' : 'actions'}...`
          : 'Syncing...'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFD54F',
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: spacing.sm,
  },
  text: {
    color: '#FFC107',
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
});
