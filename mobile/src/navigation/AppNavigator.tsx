import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/store';
import { loadStoredAuth } from '@/store/slices/authSlice';
import { colors } from '@/constants/theme';
import { linking } from './linking';

// Navigators
import { AuthNavigator } from './AuthNavigator';
import { CustomerNavigator } from './CustomerNavigator';
import { ProviderNavigator } from './ProviderNavigator';

// Modal Screens
import { BookingCreateScreen } from '@/screens/booking/BookingCreateScreen';
import { DateTimeSelectionScreen } from '@/screens/booking/DateTimeSelectionScreen';
import { LocationSelectionScreen } from '@/screens/booking/LocationSelectionScreen';
import { ServiceCustomizationScreen } from '@/screens/booking/ServiceCustomizationScreen';
import { BookingSummaryScreen } from '@/screens/booking/BookingSummaryScreen';
import { PaymentMethodScreen } from '@/screens/booking/PaymentMethodScreen';
import { MobileMoneyPaymentScreen } from '@/screens/booking/MobileMoneyPaymentScreen';
import { ManualPaymentScreen } from '@/screens/booking/ManualPaymentScreen';
import { BookingConfirmationScreen } from '@/screens/booking/BookingConfirmationScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const [isInitializing, setIsInitializing] = React.useState(true);

  useEffect(() => {
    // Load stored authentication on app start
    const initAuth = async () => {
      await dispatch(loadStoredAuth());
      setIsInitializing(false);
    };

    initAuth();
  }, [dispatch]);

  // Show loading screen while initializing
  if (isInitializing || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Auth Stack
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : user?.role === 'CUSTOMER' ? (
          <>
            {/* Customer Main Stack */}
            <Stack.Screen name="Customer" component={CustomerNavigator} />

            {/* Customer Modal Screens */}
            <Stack.Group screenOptions={{ presentation: 'modal', headerShown: true }}>
              <Stack.Screen
                name="BookingCreate"
                component={BookingCreateScreen}
                options={{ title: 'Create Booking' }}
              />
              <Stack.Screen
                name="DateTimeSelection"
                component={DateTimeSelectionScreen}
                options={{ title: 'Select Date & Time' }}
              />
              <Stack.Screen
                name="LocationSelection"
                component={LocationSelectionScreen}
                options={{ title: 'Select Location' }}
              />
              <Stack.Screen
                name="ServiceCustomization"
                component={ServiceCustomizationScreen}
                options={{ title: 'Customize Service' }}
              />
              <Stack.Screen
                name="BookingSummary"
                component={BookingSummaryScreen}
                options={{ title: 'Booking Summary' }}
              />
              <Stack.Screen
                name="PaymentMethod"
                component={PaymentMethodScreen}
                options={{ title: 'Payment Method' }}
              />
              <Stack.Screen
                name="MobileMoneyPayment"
                component={MobileMoneyPaymentScreen}
                options={{ title: 'Mobile Money Payment' }}
              />
              <Stack.Screen
                name="ManualPayment"
                component={ManualPaymentScreen}
                options={{ title: 'Manual Payment' }}
              />
              <Stack.Screen
                name="BookingConfirmation"
                component={BookingConfirmationScreen}
                options={{
                  title: 'Booking Confirmed',
                  headerLeft: () => null, // Prevent going back
                }}
              />
            </Stack.Group>
          </>
        ) : user?.role === 'PROVIDER' ? (
          // Provider Stack
          <Stack.Screen name="Provider" component={ProviderNavigator} />
        ) : (
          // Default to Auth if role is not set
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default AppNavigator;
