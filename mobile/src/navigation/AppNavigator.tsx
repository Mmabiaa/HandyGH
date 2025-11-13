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
          // Customer Stack
          <Stack.Screen name="Customer" component={CustomerNavigator} />
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
