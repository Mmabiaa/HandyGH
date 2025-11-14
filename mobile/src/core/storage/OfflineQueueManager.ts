import { MMKVStorage } from './MMKVStorage';
import { useNetworkStore } from '../store/networkStore';

/**
 * Offline action types that can be queued
 */
export enum OfflineActionType {
    CREATE_BOOKING = 'create_booking',
    UPDATE_BOOKING = 'update_booking',
    CANCEL_BOOKING = 'cancel_booking',
    SEND_MESSAGE = 'send_message',
    FAVORITE_PROVIDER = 'favorite_provider',
    UNFAVORITE_PROVIDER = 'unfavorite_provider',
    SUBMIT_REVIEW = 'submit_review',
    UPDATE_PROFILE = 'update_profile',
}

/**
 * Priority levels for offline actions
 */
export enum ActionPriority {
    CRITICAL = 1, // Bookings, payments
    HIGH = 2, // Messages, reviews
    MEDIUM = 3, // Favorites, profile updates
    LOW = 4, // Analytics, non-essential updates
}

/**
 * Offline action interface
 */
export interface OfflineAction {
    id: string;
    type: OfflineActionType;
    priority: ActionPriority;
    payload: any;
    timestamp: number;
    retryCount: number;
    maxRetries: number;
    lastError?: string;
}

const QUEUE_KEY = 'offline_action_queue';
const MAX_QUEUE_SIZE = 100;

/**
 * Manager for offline action queue
 * Handles queuing, persistence, and synchronization of actions when offline
 */
export class OfflineQueueManager {
    private static queue: OfflineAction[] = [];
    private static isSyncing = false;
    private static syncCallbacks: Array<(action: OfflineAction) => Promise<void>> = [];

    /**
     * Initialize the queue manager
     * Loads persisted queue from storage
     */
    static async initialize(): Promise<void> {
        await this.loadQueue();
        this.setupNetworkListener();
    }

    /**
     * Add an action to the queue
     */
    static enqueue(
        type: OfflineActionType,
        payload: any,
        priority: ActionPriority = ActionPriority.MEDIUM
    ): string {
        const action: OfflineAction = {
            id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            priority,
            payload,
            timestamp: Date.now(),
            retryCount: 0,
            maxRetries: this.getMaxRetries(type),
        };

        this.queue.push(action);
        this.sortQueue();
        this.persistQueue();

        console.log(`[OfflineQueue] Enqueued action: ${type}`, action.id);

        // Try to sync immediately if online
        if (useNetworkStore.getState().isConnected) {
            this.syncQueue();
        }

        return action.id;
    }

    /**
     * Remove an action from the queue
     */
    static dequeue(actionId: string): void {
        this.queue = this.queue.filter(action => action.id !== actionId);
        this.persistQueue();
        console.log(`[OfflineQueue] Dequeued action: ${actionId}`);
    }

    /**
     * Get all queued actions
     */
    static getQueue(): OfflineAction[] {
        return [...this.queue];
    }

    /**
     * Get queue size
     */
    static getQueueSize(): number {
        return this.queue.length;
    }

    /**
     * Clear the entire queue
     */
    static clearQueue(): void {
        this.queue = [];
        this.persistQueue();
        console.log('[OfflineQueue] Queue cleared');
    }

    /**
     * Register a sync callback for a specific action type
     */
    static registerSyncCallback(
        callback: (action: OfflineAction) => Promise<void>
    ): void {
        this.syncCallbacks.push(callback);
    }

    /**
     * Sync the queue when network is available
     */
    static async syncQueue(): Promise<void> {
        if (this.isSyncing || this.queue.length === 0) {
            return;
        }

        const { isConnected } = useNetworkStore.getState();
        if (!isConnected) {
            console.log('[OfflineQueue] Cannot sync - offline');
            return;
        }

        this.isSyncing = true;
        console.log(`[OfflineQueue] Starting sync of ${this.queue.length} actions`);

        // Sort by priority before syncing
        this.sortQueue();

        const actionsToSync = [...this.queue];

        for (const action of actionsToSync) {
            try {
                await this.syncAction(action);
                this.dequeue(action.id);
            } catch (error) {
                console.error(`[OfflineQueue] Failed to sync action ${action.id}:`, error);
                this.handleSyncError(action, error);
            }
        }

        this.isSyncing = false;
        console.log('[OfflineQueue] Sync completed');
    }

    /**
     * Sync a single action
     */
    private static async syncAction(action: OfflineAction): Promise<void> {
        console.log(`[OfflineQueue] Syncing action: ${action.type}`, action.id);

        // Find and execute the appropriate callback
        for (const callback of this.syncCallbacks) {
            try {
                await callback(action);
                return;
            } catch (error) {
                // If callback doesn't handle this action type, continue to next
                if (error instanceof Error && error.message.includes('Unsupported action')) {
                    continue;
                }
                throw error;
            }
        }

        throw new Error(`No handler found for action type: ${action.type}`);
    }

    /**
     * Handle sync error
     */
    private static handleSyncError(action: OfflineAction, error: any): void {
        action.retryCount++;
        action.lastError = error?.message || 'Unknown error';

        if (action.retryCount >= action.maxRetries) {
            console.error(
                `[OfflineQueue] Action ${action.id} exceeded max retries, removing from queue`
            );
            this.dequeue(action.id);
        } else {
            console.log(
                `[OfflineQueue] Action ${action.id} will retry (${action.retryCount}/${action.maxRetries})`
            );
            this.persistQueue();
        }
    }

    /**
     * Sort queue by priority (critical first)
     */
    private static sortQueue(): void {
        this.queue.sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority;
            }
            return a.timestamp - b.timestamp;
        });
    }

    /**
     * Get max retries based on action type
     */
    private static getMaxRetries(type: OfflineActionType): number {
        switch (type) {
            case OfflineActionType.CREATE_BOOKING:
            case OfflineActionType.CANCEL_BOOKING:
                return 5; // Critical actions get more retries
            case OfflineActionType.SEND_MESSAGE:
            case OfflineActionType.SUBMIT_REVIEW:
                return 3;
            default:
                return 2;
        }
    }

    /**
     * Load queue from persistent storage
     */
    private static async loadQueue(): Promise<void> {
        try {
            const stored = await MMKVStorage.getString(QUEUE_KEY);
            if (stored) {
                this.queue = JSON.parse(stored);
                console.log(`[OfflineQueue] Loaded ${this.queue.length} actions from storage`);
            }
        } catch (error) {
            console.error('[OfflineQueue] Error loading queue:', error);
            this.queue = [];
        }
    }

    /**
     * Persist queue to storage
     */
    private static persistQueue(): void {
        try {
            // Limit queue size
            if (this.queue.length > MAX_QUEUE_SIZE) {
                console.warn(
                    `[OfflineQueue] Queue size exceeded ${MAX_QUEUE_SIZE}, removing oldest low-priority actions`
                );
                this.queue = this.queue
                    .sort((a, b) => {
                        if (a.priority !== b.priority) {
                            return a.priority - b.priority;
                        }
                        return b.timestamp - a.timestamp;
                    })
                    .slice(0, MAX_QUEUE_SIZE);
            }

            MMKVStorage.set(QUEUE_KEY, JSON.stringify(this.queue));
        } catch (error) {
            console.error('[OfflineQueue] Error persisting queue:', error);
        }
    }

    /**
     * Setup network listener to auto-sync when online
     */
    private static setupNetworkListener(): void {
        // Subscribe to network store changes
        let previousConnected = useNetworkStore.getState().isConnected;

        useNetworkStore.subscribe((state) => {
            const isConnected = state.isConnected;

            // Only trigger sync when transitioning from offline to online
            if (isConnected && !previousConnected && this.queue.length > 0) {
                console.log('[OfflineQueue] Network reconnected, starting sync');
                setTimeout(() => this.syncQueue(), 1000); // Delay to ensure connection is stable
            }

            previousConnected = isConnected;
        });
    }

    /**
     * Get queue statistics
     */
    static getStats(): {
        total: number;
        byPriority: Record<ActionPriority, number>;
        byType: Record<OfflineActionType, number>;
        oldestAction: number | null;
    } {
        const byPriority: Record<ActionPriority, number> = {
            [ActionPriority.CRITICAL]: 0,
            [ActionPriority.HIGH]: 0,
            [ActionPriority.MEDIUM]: 0,
            [ActionPriority.LOW]: 0,
        };

        const byType: Record<OfflineActionType, number> = {} as any;

        let oldestTimestamp: number | null = null;

        this.queue.forEach(action => {
            byPriority[action.priority]++;
            byType[action.type] = (byType[action.type] || 0) + 1;

            if (!oldestTimestamp || action.timestamp < oldestTimestamp) {
                oldestTimestamp = action.timestamp;
            }
        });

        return {
            total: this.queue.length,
            byPriority,
            byType,
            oldestAction: oldestTimestamp,
        };
    }
}
