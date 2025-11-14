/**
 * Welcome Screen
 *
 * First screen in the authentication flow.
 * Displays value proposition with animated service icons and call-to-action buttons.
 *
 * Requirements: 1.2
 * - Build WelcomeScreen layout with hero content
 * - Add animated service icons with staggered entrance
 * - Implement "Get Started" and "Sign In" CTAs
 * - Add guest access option
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../../core/theme/ThemeProvider';
import { Text } from '../../../shared/components/Text';
import { Button } from '../../../shared/components/Button';
import { spacing } from '../../../core/theme/spacing';
import type { AuthStackParamList } from '../../../core/navigation/types';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Welcome'
>;

interface ServiceIconProps {
  icon: string;
  label: string;
  delay: number;
}

const ServiceIcon: React.FC<ServiceIconProps> = ({ icon, label, delay }) => {
  const { theme } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
    );

    translateY.value = withDelay(
      delay,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
    );

    scale.value = withDelay(
      delay,
      withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.ease),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.serviceIcon, animatedStyle]}>
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: theme.colors.primaryLight },
        ]}
      >
        <Text variant="h3" color="primary">
          {icon}
        </Text>
      </View>
      <Text variant="caption" color="textSecondary" style={styles.iconLabel}>
        {label}
      </Text>
    </Animated.View>
  );
};

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { theme } = useTheme();

  // Animation values for hero content
  const heroOpacity = useSharedValue(0);
  const heroTranslateY = useSharedValue(30);

  useEffect(() => {
    heroOpacity.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });

    heroTranslateY.value = withTiming(0, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslateY.value }],
  }));

  const handleGetStarted = () => {
    navigation.navigate('PhoneInput');
  };

  const handleSignIn = () => {
    navigation.navigate('PhoneInput');
  };

  const handleGuestAccess = () => {
    // TODO: Implement guest access navigation
    // For now, navigate to phone input
    navigation.navigate('PhoneInput');
  };

  const services = [
    { icon: '🔧', label: 'Plumbing', delay: 100 },
    { icon: '⚡', label: 'Electrical', delay: 200 },
    { icon: '🧹', label: 'Cleaning', delay: 300 },
    { icon: '🎨', label: 'Painting', delay: 400 },
    { icon: '🪴', label: 'Gardening', delay: 500 },
    { icon: '🔨', label: 'Carpentry', delay: 600 },
    { icon: '❄️', label: 'AC Repair', delay: 700 },
    { icon: '🚗', label: 'Auto Care', delay: 800 },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <Animated.View style={[styles.heroSection, heroAnimatedStyle]}>
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text variant="h1" color="textOnPrimary" style={styles.logoText}>
              H
            </Text>
          </View>
        </View>

        <Text variant="h1" color="text" style={styles.title}>
          Welcome to HandyGH
        </Text>

        <Text variant="bodyLarge" color="textSecondary" style={styles.subtitle}>
          Find trusted, verified service providers across Ghana
        </Text>
      </Animated.View>

      {/* Service Icons Grid */}
      <View style={styles.servicesSection}>
        <Text variant="h6" color="text" style={styles.servicesTitle}>
          Popular Services
        </Text>

        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <ServiceIcon
              key={index}
              icon={service.icon}
              label={service.label}
              delay={service.delay}
            />
          ))}
        </View>
      </View>

      {/* Value Propositions */}
      <View style={styles.valuePropsSection}>
        <ValueProp
          icon="✓"
          title="Verified Professionals"
          description="All service providers are verified and rated by customers"
        />
        <ValueProp
          icon="💳"
          title="Secure Payments"
          description="Pay safely with Mobile Money or card"
        />
        <ValueProp
          icon="⭐"
          title="Quality Guaranteed"
          description="Read reviews and choose the best providers"
        />
      </View>

      {/* Call to Action Buttons */}
      <View style={styles.ctaSection}>
        <Button
          variant="primary"
          size="large"
          fullWidth
          onPress={handleGetStarted}
          accessibilityLabel="Get started with HandyGH"
        >
          Get Started
        </Button>

        <Button
          variant="outline"
          size="large"
          fullWidth
          onPress={handleSignIn}
          accessibilityLabel="Sign in to your account"
          style={styles.signInButton}
        >
          Sign In
        </Button>

        <Button
          variant="ghost"
          size="medium"
          fullWidth
          onPress={handleGuestAccess}
          accessibilityLabel="Continue as guest"
          style={styles.guestButton}
        >
          Continue as Guest
        </Button>
      </View>
    </ScrollView>
  );
};

interface ValuePropProps {
  icon: string;
  title: string;
  description: string;
}

const ValueProp: React.FC<ValuePropProps> = ({ icon, title, description }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.valueProp}>
      <View
        style={[
          styles.valuePropIcon,
          { backgroundColor: theme.colors.secondaryLight },
        ]}
      >
        <Text variant="h4">{icon}</Text>
      </View>
      <View style={styles.valuePropContent}>
        <Text variant="labelLarge" color="text" style={styles.valuePropTitle}>
          {title}
        </Text>
        <Text variant="bodySmall" color="textSecondary">
          {description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  servicesSection: {
    marginBottom: spacing.xl,
  },
  servicesTitle: {
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
  },
  serviceIcon: {
    alignItems: 'center',
    width: 70,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  iconLabel: {
    textAlign: 'center',
  },
  valuePropsSection: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  valueProp: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  valuePropIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valuePropContent: {
    flex: 1,
  },
  valuePropTitle: {
    marginBottom: spacing.xs,
  },
  ctaSection: {
    gap: spacing.md,
  },
  signInButton: {
    marginTop: spacing.xs,
  },
  guestButton: {
    marginTop: spacing.xs,
  },
});

export default WelcomeScreen;
