import { renderHook, waitFor } from '@testing-library/react-native';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStatus } from '../useNetworkStatus';

// Mock NetInfo
jest.mock('@react-native-community/netinfo');

describe('useNetworkStatus', () => {
  const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return initial network status', async () => {
    const mockState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    };

    mockNetInfo.fetch.mockResolvedValue(mockState as any);
    mockNetInfo.addEventListener.mockReturnValue(() => {});

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    expect(result.current.isInternetReachable).toBe(true);
    expect(result.current.type).toBe('wifi');
  });

  it('should update when network status changes', async () => {
    const initialState = {
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    };

    const offlineState = {
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    };

    let listener: ((state: any) => void) | null = null;

    mockNetInfo.fetch.mockResolvedValue(initialState as any);
    mockNetInfo.addEventListener.mockImplementation((callback) => {
      listener = callback;
      return () => {};
    });

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate network change
    if (listener) {
      listener(offlineState as any);
    }

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });

    expect(result.current.isInternetReachable).toBe(false);
    expect(result.current.type).toBe('none');
  });

  it('should handle null values gracefully', async () => {
    const mockState = {
      isConnected: null,
      isInternetReachable: null,
      type: null,
    };

    mockNetInfo.fetch.mockResolvedValue(mockState as any);
    mockNetInfo.addEventListener.mockReturnValue(() => {});

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
    });

    expect(result.current.isInternetReachable).toBe(null);
  });

  it('should cleanup listener on unmount', () => {
    const unsubscribe = jest.fn();

    mockNetInfo.fetch.mockResolvedValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    } as any);
    mockNetInfo.addEventListener.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useNetworkStatus());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
