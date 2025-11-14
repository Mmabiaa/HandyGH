import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../Text';
import { spacing } from '../../../core/theme';

interface CachedContentIndicatorProps {
  /**
   * Timestamp when the content was last updated
   */
  lastUpdated: number;
  /**
   * Whether to show the indicator (default: true when offline)
   */
  visible?: boolean;
  /**
   * Custom message to display
   */
  message?: string;
}

/**
 * Indicator component that shows when content is cached/offline
 * Displays the last update time to inform users about data freshness
 */
export const CachedContentIndicator: React.FC<CachedContentIndicatorProps> = ({
  lastUpdated,
  visible = true,
  message,
}) => {
  if (!visible) {
    return null;
  }

  const getTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.dot} />
      <Text variant="caption" style={styles.text}>
        {message || `Cached content • Updated ${getTimeAgo(lastUpdated)}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF9800',
    marginRight: spacing.xs,
  },
  text: {
    color: '#616161',
  },
});
