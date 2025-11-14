import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Text } from '../Text';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface ConnectionStatusBannerProps {
    /**
     * Whether to show the banner when online (default: false)
     * Usually we only show when offline
     */
    showWhenOnline?: boolean;
}

/**
 * Banner component that displays network connection status
 * Automatically shows/hides based on network connectivity
 * Animates in from the top when offline
 */
export const ConnectionStatusBanner: React.FC<ConnectionStatusBannerProps> = ({
    showWhenOnline = false,
}) => {
    const { isConnected, isInternetReachable } = useNetworkStatus();
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    const isOffline = !isConnected || isInternetReachable === false;
    const shouldShow = isOffline || (showWhenOnline && isConnected);

    useEffect(() => {
        if (shouldShow) {
            // Slide in from top
            translateY.value = withSpring(0, {
                damping: 15,
                stiffness: 150,
            });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            // Slide out to top
            translateY.value = withTiming(-100, { duration: 300 });
            opacity.value = withTiming(0, { duration: 300 });
        }
    }, [shouldShow, translateY, opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    if (!shouldShow && !isOffline) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                isOffline ? styles.offline : styles.online,
                animatedStyle,
            ]}
        >
            <View style={styles.content}>
                <Text
                    variant="bodySmall"
                    style={styles.text}
                    accessibilityLabel={
                        isOffline
                            ? 'No internet connection'
                            : 'Connected to internet'
                    }
                >
                    {isOffline
                        ? 'No internet connection'
                        : 'Back online'}
                </Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    offline: {
        backgroundColor: '#F44336',
    },
    online: {
        backgroundColor: '#4CAF50',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
