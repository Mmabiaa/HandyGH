import { useEffect, useState } from 'react';
import {
  OfflineQueueManager,
  OfflineActionType,
  ActionPriority,
  type OfflineAction,
} from '../../core/storage';
import { useNetworkStatus } from './useNetworkStatus';

/**
 * Hook to interact with the offline action queue
 * Provides methods to enqueue actions and monitor queue status
 */
export const useOfflineQueue = () => {
  const { isConnected } = useNetworkStatus();
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Update queue size periodically
    const updateQueueSize = () => {
      setQueueSize(OfflineQueueManager.getQueueSize());
    };

    updateQueueSize();
    const interval = setInterval(updateQueueSize, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Trigger sync when coming back online
    if (isConnected && queueSize > 0) {
      setIsSyncing(true);
      OfflineQueueManager.syncQueue().finally(() => {
        setIsSyncing(false);
        setQueueSize(OfflineQueueManager.getQueueSize());
      });
    }
  }, [isConnected, queueSize]);

  /**
   * Enqueue an action to be executed when online
   */
  const enqueueAction = (
    type: OfflineActionType,
    payload: any,
    priority?: ActionPriority
  ): string => {
    const actionId = OfflineQueueManager.enqueue(type, payload, priority);
    setQueueSize(OfflineQueueManager.getQueueSize());
    return actionId;
  };

  /**
   * Get all queued actions
   */
  const getQueue = (): OfflineAction[] => {
    return OfflineQueueManager.getQueue();
  };

  /**
   * Clear the queue
   */
  const clearQueue = (): void => {
    OfflineQueueManager.clearQueue();
    setQueueSize(0);
  };

  /**
   * Get queue statistics
   */
  const getStats = () => {
    return OfflineQueueManager.getStats();
  };

  return {
    queueSize,
    isSyncing,
    enqueueAction,
    getQueue,
    clearQueue,
    getStats,
    isOnline: isConnected,
  };
};
