import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '../Text';
import { spacing } from '../../../core/theme';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';

interface OfflineModeBannerProps {
  /**
   * Callback when user taps the banner
   */
  onPress?: () => void;
  /**
   * Whether to show queue size
   */
  showQueueSize?: boolean;
}

/**
 * Banner component that displays offline mode information
 * Shows when the app is offline and optionally displays queued actions
 */
export const OfflineModeBanner: React.FC<OfflineModeBannerProps> = ({
  onPress,
  showQueueSize = true,
}) => {
  const { isConnected } = useNetworkStatus();
  const { queueSize } = useOfflineQueue();

  if (isConnected) {
    return null;
  }

  const content = (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <View style={styles.icon} />
      </View>
      <View style={styles.textContainer}>
        <Text variant="bodySmall" style={styles.title}>
          Offline Mode
        </Text>
        <Text variant="caption" style={styles.subtitle}>
          {showQueueSize && queueSize > 0
            ? `${queueSize} ${queueSize === 1 ? 'action' : 'actions'} queued`
            : 'Some features may be limited'}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.touchable}
        accessibilityLabel="View offline mode details"
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  touchable: {
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#FFB74D',
    borderBottomWidth: 1,
    borderBottomColor: '#FF9800',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  icon: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9800',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#212121',
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    color: '#616161',
  },
});
