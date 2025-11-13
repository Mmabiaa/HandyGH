/**
 * Professional Authentication Hooks
 *
 * React Query mutations for authentication with:
 * - Automatic state management
 * - Error handling
 * - Loading states
 * - Optimistic updates
 *
 * @requirements Req 1 (Authentication), Req 15 (Security)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as LocalAuthentication from 'expo-local-authentication';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

/**
 * Hook for requesting OTP
 */
export const useRequestOTP = () => {
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);

  return useMutation({
    mutationFn: (phone: string) => authService.requestOTP(phone),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setLoading(false);
      console.log('OTP requested successfully:', data);
    },
    onError: (error: any) => {
      setLoading(false);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      setError(errorMessage);
      console.error('OTP request failed:', error);
    },
  });
};

/**
 * Hook for verifying OTP
 */
export const useVerifyOTP = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setTokens = useAuthStore((state) => state.setTokens);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      authService.verifyOTP(phone, otp),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: async (data) => {
      setLoading(false);

      // Store user and tokens
      setUser(data.user);
      await setTokens(data.tokens);

      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['user'] });

      console.log('OTP verified successfully:', data.user);
    },
    onError: (error: any) => {
      setLoading(false);
      const errorMessage = error.response?.data?.message || error.message || 'Invalid OTP';
      setError(errorMessage);
      console.error('OTP verification failed:', error);
    },
  });
};

/**
 * Hook for biometric authentication
 */
export const useBiometricAuth = () => {
  const setBiometricEnabled = useAuthStore((state) => state.setBiometricEnabled);
  const checkBiometricAvailability = useAuthStore((state) => state.checkBiometricAvailability);

  const authenticate = async (): Promise<boolean> => {
    try {
      const isAvailable = await checkBiometricAvailability();

      if (!isAvailable) {
        console.log('Biometric authentication not available');
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access HandyGH',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  const enableBiometric = async (): Promise<boolean> => {
    const success = await authenticate();
    if (success) {
      setBiometricEnabled(true);
    }
    return success;
  };

  const disableBiometric = () => {
    setBiometricEnabled(false);
  };

  return {
    authenticate,
    enableBiometric,
    disableBiometric,
    checkAvailability: checkBiometricAvailability,
  };
};

/**
 * Hook for logout
 */
export const useLogout = () => {
  const tokens = useAuthStore((state) => state.tokens);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (tokens?.refresh) {
        await authService.logout(tokens.refresh);
      }
    },
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: async () => {
      setLoading(false);

      // Clear auth state
      await clearAuth();

      // Clear all queries
      queryClient.clear();

      console.log('Logged out successfully');
    },
    onError: (error: any) => {
      setLoading(false);
      const errorMessage = error.response?.data?.message || error.message || 'Logout failed';
      setError(errorMessage);
      console.error('Logout failed:', error);

      // Clear auth anyway on error
      clearAuth();
    },
  });
};

/**
 * Hook for updating user role
 */
export const useUpdateRole = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: 'CUSTOMER' | 'PROVIDER') => authService.updateUserRole(role),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setLoading(false);

      // Update user in store
      setUser(data);

      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['user'] });

      console.log('Role updated successfully:', data.role);
    },
    onError: (error: any) => {
      setLoading(false);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update role';
      setError(errorMessage);
      console.error('Role update failed:', error);
    },
  });
};

/**
 * Main authentication hook
 * Provides all auth functionality in one place
 */
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const biometricEnabled = useAuthStore((state) => state.biometricEnabled);
  const loadStoredAuth = useAuthStore((state) => state.loadStoredAuth);

  const requestOTP = useRequestOTP();
  const verifyOTP = useVerifyOTP();
  const logout = useLogout();
  const updateRole = useUpdateRole();
  const biometric = useBiometricAuth();

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    biometricEnabled,

    // Actions
    requestOTP: requestOTP.mutate,
    verifyOTP: verifyOTP.mutate,
    logout: logout.mutate,
    updateRole: updateRole.mutate,
    loadStoredAuth,

    // Biometric
    biometric,

    // Mutation states
    isRequestingOTP: requestOTP.isPending,
    isVerifyingOTP: verifyOTP.isPending,
    isLoggingOut: logout.isPending,
    isUpdatingRole: updateRole.isPending,
  };
};
