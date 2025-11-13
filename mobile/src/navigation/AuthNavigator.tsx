import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';

// Screens
import { OnboardingScreen } from '@/screens/auth/OnboardingScreen';
import { PhoneInputScreen } from '@/screens/auth/PhoneInputScreen';
import { OTPVerificationScreen } from '@/screens/auth/OTPVerificationScreen';
import { RoleSelectionScreen } from '@/screens/auth/RoleSelectionScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen
        name="PhoneInput"
        component={PhoneInputScreen}
        options={{ headerShown: true, title: 'Sign In' }}
      />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
        options={{ headerShown: true, title: 'Verify OTP' }}
      />
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{ headerShown: true, title: 'Select Role' }}
      />
    </Stack.Navigator>
  );
};
