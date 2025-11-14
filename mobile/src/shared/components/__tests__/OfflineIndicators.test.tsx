/**
 * Offline Indicators Integration Tests
 *
 * Tests for CachedContentIndicator, SyncStatusIndicator, and OfflineModeBanner
 * Requirement: 14.11
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { CachedContentIndicator } from '../CachedContentIndicator/CachedContentIndicator';
import { SyncStatusIndicator } from '../SyncStatusIndicator/SyncStatusIndicator';
import { OfflineModeBanner } from '../OfflineModeBanner/OfflineModeBanner';

// Mock hooks
jest.mock('../../hooks/useNetworkStatus', () => ({
  useNetworkStatus: jest.fn(() => ({ isConnected: false })),
}));

jest.mock('../../hooks/useOfflineQueue', () => ({
  useOfflineQueue: jest.fn(() => ({
    isSyncing: false,
    queueSize: 0,
  })),
}));

describe('Offline Indicators', () => {
  describe('CachedContentIndicator', () => {
    it('should render when visible', () => {
      const lastUpdated = Date.now() - 60000; // 1 minute ago
      const { getByText } = render(
        <CachedContentIndicator lastUpdated={lastUpdated} visible={true} />
      );

      expect(getByText(/Cached content/)).toBeTruthy();
      expect(getByText(/1m ago/)).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const lastUpdated = Date.now();
      const { queryByText } = render(
        <CachedContentIndicator lastUpdated={lastUpdated} visible={false} />
      );

      expect(queryByText(/Cached content/)).toBeNull();
    });

    it('should display custom message when provided', () => {
      const lastUpdated = Date.now();
      const customMessage = 'Custom offline message';
      const { getByText } = render(
        <CachedContentIndicator
          lastUpdated={lastUpdated}
          visible={true}
          message={customMessage}
        />
      );

      expect(getByText(customMessage)).toBeTruthy();
    });

    it('should format time correctly for different durations', () => {
      const now = Date.now();

      // Just now
      const { getByText: getByText1 } = render(
        <CachedContentIndicator lastUpdated={now} visible={true} />
      );
      expect(getByText1(/just now/)).toBeTruthy();

      // Minutes ago
      const { getByText: getByText2 } = render(
        <CachedContentIndicator lastUpdated={now - 5 * 60000} visible={true} />
      );
      expect(getByText2(/5m ago/)).toBeTruthy();

      // Hours ago
      const { getByText: getByText3 } = render(
        <CachedContentIndicator lastUpdated={now - 2 * 3600000} visible={true} />
      );
      expect(getByText3(/2h ago/)).toBeTruthy();

      // Days ago
      const { getByText: getByText4 } = render(
        <CachedContentIndicator lastUpdated={now - 3 * 86400000} visible={true} />
      );
      expect(getByText4(/3d ago/)).toBeTruthy();
    });
  });

  describe('SyncStatusIndicator', () => {
    it('should not render when not syncing', () => {
      const { queryByText } = render(<SyncStatusIndicator />);
      expect(queryByText(/Syncing/)).toBeNull();
    });

    it('should render when syncing', () => {
      const useOfflineQueue = require('../../hooks/useOfflineQueue').useOfflineQueue;
      useOfflineQueue.mockReturnValue({
        isSyncing: true,
        queueSize: 3,
      });

      const { getByText } = render(<SyncStatusIndicator />);
      expect(getByText(/Syncing 3 actions/)).toBeTruthy();
    });

    it('should show singular form for single action', () => {
      const useOfflineQueue = require('../../hooks/useOfflineQueue').useOfflineQueue;
      useOfflineQueue.mockReturnValue({
        isSyncing: true,
        queueSize: 1,
      });

      const { getByText } = render(<SyncStatusIndicator />);
      expect(getByText(/Syncing 1 action/)).toBeTruthy();
    });

    it('should respect visible prop', () => {
      const { getByText } = render(<SyncStatusIndicator visible={true} />);
      expect(getByText(/Syncing/)).toBeTruthy();
    });
  });

  describe('OfflineModeBanner', () => {
    it('should render when offline', () => {
      const { getByText } = render(<OfflineModeBanner />);
      expect(getByText('Offline Mode')).toBeTruthy();
    });

    it('should not render when online', () => {
      const useNetworkStatus = require('../../hooks/useNetworkStatus').useNetworkStatus;
      useNetworkStatus.mockReturnValue({ isConnected: true });

      const { queryByText } = render(<OfflineModeBanner />);
      expect(queryByText('Offline Mode')).toBeNull();
    });

    it('should show queue size when enabled', () => {
      const useOfflineQueue = require('../../hooks/useOfflineQueue').useOfflineQueue;
      useOfflineQueue.mockReturnValue({
        isSyncing: false,
        queueSize: 5,
      });

      const { getByText } = render(<OfflineModeBanner showQueueSize={true} />);
      expect(getByText(/5 actions queued/)).toBeTruthy();
    });

    it('should not show queue size when disabled', () => {
      const useOfflineQueue = require('../../hooks/useOfflineQueue').useOfflineQueue;
      useOfflineQueue.mockReturnValue({
        isSyncing: false,
        queueSize: 5,
      });

      const { queryByText } = render(<OfflineModeBanner showQueueSize={false} />);
      expect(queryByText(/5 actions queued/)).toBeNull();
    });

    it('should be pressable when onPress is provided', () => {
      const onPress = jest.fn();
      const { getByLabelText } = render(<OfflineModeBanner onPress={onPress} />);

      const banner = getByLabelText('View offline mode details');
      expect(banner).toBeTruthy();
    });
  });
});
