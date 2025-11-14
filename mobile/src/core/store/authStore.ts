import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SecureTokenStorage } from '../storage';
import { zustandStorage } from '../storage/ZustandStorageAdapter';
import type { User } from './types';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  hydrate: () => Promise<void>;
}

/**
 * Auth store for managing user authentication state
 * Uses Zustand with MMKV persistence for fast hydration
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Set user
      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      // Set authenticated status
      setAuthenticated: (isAuthenticated) => {
        set({ isAuthenticated });
      },

      // Set loading status
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      // Login action
      login: async (user, accessToken, refreshToken) => {
        try {
          // Save tokens securely
          await SecureTokenStorage.saveTokens(accessToken, refreshToken);

          // Update state
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error during login:', error);
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        try {
          // Clear secure tokens
          await SecureTokenStorage.clearTokens();

          // Clear auth state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error during logout:', error);
          throw error;
        }
      },

      // Update user profile
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          });
        }
      },

      // Hydrate auth state on app start
      hydrate: async () => {
        try {
          set({ isLoading: true });

          // Check if tokens exist
          const hasTokens = await SecureTokenStorage.hasTokens();

          if (hasTokens) {
            // User is authenticated, state will be restored from persistence
            set({ isAuthenticated: true });
          } else {
            // No tokens, user is not authenticated
            set({
              user: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error('Error hydrating auth state:', error);
          set({
            user: null,
            isAuthenticated: false,
          });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      // Only persist user data, not loading states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
