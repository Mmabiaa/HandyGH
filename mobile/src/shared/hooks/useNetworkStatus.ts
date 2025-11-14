import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string | null;
}

/**
 * Hook to monitor network connectivity status
 * Provides real-time updates when network status changes
 *
 * @returns NetworkStatus object with connection information
 *
 * @example
 * const { isConnected, isInternetReachable } = useNetworkStatus();
 *
 * if (!isConnected) {
 *   return <OfflineBanner />;
 * }
 */
export const useNetworkStatus = (): NetworkStatus => {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isConnected: true,
        isInternetReachable: null,
        type: null,
    });

    useEffect(() => {
        // Get initial network state
        const getInitialState = async () => {
            const state = await NetInfo.fetch();
            updateNetworkStatus(state);
        };

        getInitialState();

        // Subscribe to network state changes
        const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            updateNetworkStatus(state);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const updateNetworkStatus = (state: NetInfoState) => {
        setNetworkStatus({
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable,
            type: state.type,
        });
    };

    return networkStatus;
};
