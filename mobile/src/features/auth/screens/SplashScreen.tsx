/**
 * Splash Screen
 *
 * Initial loading screen displayed when the app launches.
 * Shows HandyGH branding with smooth animations and performs initialization tasks.
 *
 * Requirements: 1.1
 * - Create SplashScreen with logo and loading animation
 * - Add smooth brand animation experience
 * - Implement auto-navigation after 2 seconds
 * - Preload critical assets during splash
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { Text } from '../../../shared/components/Text';
import type { RootStackParamList } from '../../../core/navigation/types';

type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { theme } = useTheme();

  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const loadingOpacity = useSharedValue(0);

  // Preload critical assets
  const preloadAssets = async () => {
    try {
      // Preload any critical images, fonts, or data here
      // For now, we'll just simulate asset loading
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Error preloading assets:', error);
    }
  };

  // Navigate to next screen
  const navigateToAuth = () => {
    navigation.replace('Auth', { screen: 'Welcome' });
  };

  useEffect(() => {
    // Start animations
    logoScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });

    logoOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });

    titleTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });

    titleOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });

    subtitleOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    loadingOpacity.value = withSequence(
      withTiming(0, { duration: 500 }),
      withTiming(1, { duration: 400 }),
    );

    // Preload assets and navigate after 2 seconds
    const initializeApp = async () => {
      await preloadAssets();

      // Wait for minimum splash duration (2 seconds)
      setTimeout(() => {
        runOnJS(navigateToAuth)();
      }, 2000);
    };

    initializeApp();
  }, []);

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
    opacity: titleOpacity.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: loadingOpacity.value,
  }));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.secondary },
      ]}
      accessibilityLabel="HandyGH splash screen"
    >
      {/* Logo Container */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary }]}>
          <Text variant="h1" color="textOnPrimary" style={styles.logoText}>
            H
          </Text>
        </View>
      </Animated.View>

      {/* Title */}
      <Animated.View style={titleAnimatedStyle}>
        <Text variant="h1" color="textOnSecondary" style={styles.title}>
          HandyGH
        </Text>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View style={subtitleAnimatedStyle}>
        <Text variant="body" color="textOnSecondary" style={styles.subtitle}>
          Connecting You to Quality Services
        </Text>
      </Animated.View>

      {/* Loading Indicator */}
      <Animated.View style={[styles.loadingContainer, loadingAnimatedStyle]}>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
          <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.9,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default SplashScreen;
