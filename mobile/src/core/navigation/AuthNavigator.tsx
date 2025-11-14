/**
 * Auth Navigator
 *
 * Handles the authentication and onboarding flow:
 * - Welcome screen
 * - Phone number input
 * - OTP verification
 * - Role selection (Customer or Provider)
 * - Profile setup
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './types';

// Placeholder screens - will be implemented in later tasks
import WelcomeScreen from '../../features/auth/screens/WelcomeScreen';
import PhoneInputScreen from '../../features/auth/screens/PhoneInputScreen';
import OTPVerificationScreen from '../../features/auth/screens/OTPVerificationScreen';
import RoleSelectionScreen from '../../features/auth/screens/RoleSelectionScreen';
import ProfileSetupScreen from '../../features/auth/screens/ProfileSetupScreen';
import ProviderOnboardingScreen from '../../features/auth/screens/ProviderOnboardingScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false, // Prevent back gesture during auth flow
      }}
    >
      <Stack.Screen
        name="Welcome"
        component={WelcomeScreen}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="PhoneInput"
        component={PhoneInputScreen}
      />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
        options={{
          gestureEnabled: true, // Allow going back to phone input
        }}
      />
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
      />
      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
      />
      <Stack.Screen
        name="ProviderOnboarding"
        component={ProviderOnboardingScreen}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
