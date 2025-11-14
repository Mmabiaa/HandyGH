import { create } from 'zustand';
import NetInfo from '@react-native-community/netinfo';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  setNetworkStatus: (status: {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string | null;
  }) => void;
  initialize: () => void;
}

/**
 * Zustand store for managing global network state
 * Provides centralized network status that can be accessed throughout the app
 */
export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true,
  isInternetReachable: null,
  type: null,

  setNetworkStatus: (status) => set(status),

  initialize: () => {
    // Get initial state
    NetInfo.fetch().then((state) => {
      set({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });

    // Subscribe to changes
    NetInfo.addEventListener((state) => {
      set({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      });
    });
  },
}));
