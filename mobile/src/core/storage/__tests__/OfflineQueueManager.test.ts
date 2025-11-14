import {
  OfflineQueueManager,
  OfflineActionType,
  ActionPriority,
} from '../OfflineQueueManager';
import { MMKVStorage } from '../MMKVStorage';
import { useNetworkStore } from '../../store/networkStore';

// Mock dependencies
jest.mock('../MMKVStorage');
jest.mock('../../store/networkStore');

describe('OfflineQueueManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset queue
    OfflineQueueManager.clearQueue();
  });

  describe('enqueue', () => {
    it('should add action to queue', () => {
      const actionId = OfflineQueueManager.enqueue(
        OfflineActionType.CREATE_BOOKING,
        { bookingData: 'test' },
        ActionPriority.CRITICAL
      );

      expect(actionId).toBeDefined();
      expect(OfflineQueueManager.getQueueSize()).toBe(1);

      const queue = OfflineQueueManager.getQueue();
      expect(queue[0].type).toBe(OfflineActionType.CREATE_BOOKING);
      expect(queue[0].priority).toBe(ActionPriority.CRITICAL);
      expect(queue[0].payload).toEqual({ bookingData: 'test' });
    });

    it('should sort queue by priority', () => {
      OfflineQueueManager.enqueue(
        OfflineActionType.UPDATE_PROFILE,
        {},
        ActionPriority.MEDIUM
      );
      OfflineQueueManager.enqueue(
        OfflineActionType.CREATE_BOOKING,
        {},
        ActionPriority.CRITICAL
      );
      OfflineQueueManager.enqueue(
        OfflineActionType.SEND_MESSAGE,
        {},
        ActionPriority.HIGH
      );

      const queue = OfflineQueueManager.getQueue();

      expect(queue[0].priority).toBe(ActionPriority.CRITICAL);
      expect(queue[1].priority).toBe(ActionPriority.HIGH);
      expect(queue[2].priority).toBe(ActionPriority.MEDIUM);
    });

    it('should persist queue to storage', () => {
      OfflineQueueManager.enqueue(
        OfflineActionType.CREATE_BOOKING,
        { test: 'data' }
      );

      expect(MMKVStorage.set).toHaveBeenCalled();
    });
  });

  describe('dequeue', () => {
    it('should remove action from queue', () => {
      const actionId = OfflineQueueManager.enqueue(
        OfflineActionType.CREATE_BOOKING,
        {}
      );

      expect(OfflineQueueManager.getQueueSize()).toBe(1);

      OfflineQueueManager.dequeue(actionId);

      expect(OfflineQueueManager.getQueueSize()).toBe(0);
    });

    it('should persist queue after dequeue', () => {
      const actionId = OfflineQueueManager.enqueue(
        OfflineActionType.CREATE_BOOKING,
        {}
      );

      jest.clearAllMocks();

      OfflineQueueManager.dequeue(actionId);

      expect(MMKVStorage.set).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      OfflineQueueManager.enqueue(
        OfflineActionType.CREATE_BOOKING,
        {},
        ActionPriority.CRITICAL
      );
      OfflineQueueManager.enqueue(
        OfflineActionType.CREATE_BOOKING,
        {},
        ActionPriority.CRITICAL
      );
      OfflineQueueManager.enqueue(
        OfflineActionType.SEND_MESSAGE,
        {},
        ActionPriority.HIGH
      );

      const stats = OfflineQueueManager.getStats();

      expect(stats.total).toBe(3);
      expect(stats.byPriority[ActionPriority.CRITICAL]).toBe(2);
      expect(stats.byPriority[ActionPriority.HIGH]).toBe(1);
      expect(stats.byType[OfflineActionType.CREATE_BOOKING]).toBe(2);
      expect(stats.byType[OfflineActionType.SEND_MESSAGE]).toBe(1);
      expect(stats.oldestAction).toBeDefined();
    });

    it('should return empty stats for empty queue', () => {
      const stats = OfflineQueueManager.getStats();

      expect(stats.total).toBe(0);
      expect(stats.oldestAction).toBeNull();
    });
  });

  describe('syncQueue', () => {
    it('should not sync when offline', async () => {
      (useNetworkStore.getState as jest.Mock).mockReturnValue({
        isConnected: false,
      });

      OfflineQueueManager.enqueue(OfflineActionType.CREATE_BOOKING, {});

      await OfflineQueueManager.syncQueue();

      // Queue should still have the action
      expect(OfflineQueueManager.getQueueSize()).toBe(1);
    });

    it('should sync actions when online', async () => {
      (useNetworkStore.getState as jest.Mock).mockReturnValue({
        isConnected: true,
      });

      const mockCallback = jest.fn().mockResolvedValue(undefined);
      OfflineQueueManager.registerSyncCallback(mockCallback);

      OfflineQueueManager.enqueue(OfflineActionType.CREATE_BOOKING, {
        test: 'data',
      });

      await OfflineQueueManager.syncQueue();

      expect(mockCallback).toHaveBeenCalled();
      expect(OfflineQueueManager.getQueueSize()).toBe(0);
    });

    it('should handle sync errors and retry', async () => {
      (useNetworkStore.getState as jest.Mock).mockReturnValue({
        isConnected: true,
      });

      const mockCallback = jest
        .fn()
        .mockRejectedValueOnce(new Error('Sync failed'));
      OfflineQueueManager.registerSyncCallback(mockCallback);

      OfflineQueueManager.enqueue(OfflineActionType.CREATE_BOOKING, {});

      await OfflineQueueManager.syncQueue();

      // Action should still be in queue for retry
      expect(OfflineQueueManager.getQueueSize()).toBe(1);

      const queue = OfflineQueueManager.getQueue();
      expect(queue[0].retryCount).toBe(1);
      expect(queue[0].lastError).toBe('Sync failed');
    });
  });

  describe('clearQueue', () => {
    it('should clear all actions', () => {
      OfflineQueueManager.enqueue(OfflineActionType.CREATE_BOOKING, {});
      OfflineQueueManager.enqueue(OfflineActionType.SEND_MESSAGE, {});

      expect(OfflineQueueManager.getQueueSize()).toBe(2);

      OfflineQueueManager.clearQueue();

      expect(OfflineQueueManager.getQueueSize()).toBe(0);
    });
  });
});
