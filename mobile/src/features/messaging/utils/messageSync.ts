import { messageRepository } from '../../../core/storage/database/repositories/MessageRepository';
import { messageService } from '../../../core/api/services/MessageService';
import SocketManager from '../../../core/realtime/SocketManager';

/**
 * Sync unsynced messages with the server
 * Called when connection is restored
 */
export const syncPendingMessages = async (): Promise<void> => {
  try {
    const unsyncedMessages = await messageRepository.getUnsyncedMessages();

    if (unsyncedMessages.length === 0) {
      console.log('[MessageSync] No pending messages to sync');
      return;
    }

    console.log(`[MessageSync] Syncing ${unsyncedMessages.length} pending messages`);

    const socketManager = SocketManager.getInstance();

    for (const message of unsyncedMessages) {
      try {
        // Try to send via WebSocket first
        if (socketManager.isConnected()) {
          socketManager.emit('message:send', {
            bookingId: message.bookingId,
            content: message.content,
            type: message.type,
            tempId: message.id,
          });

          // Mark as synced (will be confirmed by server response)
          await messageRepository.updateSyncStatus(message.id, 'synced');
        } else {
          // Fallback to HTTP
          const sentMessage = await messageService.sendMessage({
            bookingId: message.bookingId,
            content: message.content,
            type: message.type === 'system' ? 'text' : message.type,
          });

          // Delete temp message and insert real one
          await messageRepository.delete(message.id);
          await messageRepository.insert({
            ...sentMessage,
            createdAt: new Date(sentMessage.createdAt),
            syncStatus: 'synced',
          });
        }

        console.log(`[MessageSync] Synced message ${message.id}`);
      } catch (error) {
        console.error(`[MessageSync] Failed to sync message ${message.id}:`, error);
        // Mark as failed
        await messageRepository.updateSyncStatus(message.id, 'failed');
      }
    }

    console.log('[MessageSync] Sync complete');
  } catch (error) {
    console.error('[MessageSync] Sync failed:', error);
  }
};

/**
 * Retry failed messages
 */
export const retryFailedMessages = async (): Promise<void> => {
  try {
    const unsyncedMessages = await messageRepository.getUnsyncedMessages();
    const failedMessages = unsyncedMessages.filter(
      (msg) => msg.syncStatus === 'failed'
    );

    if (failedMessages.length === 0) {
      console.log('[MessageSync] No failed messages to retry');
      return;
    }

    console.log(`[MessageSync] Retrying ${failedMessages.length} failed messages`);

    // Reset to pending and sync
    for (const message of failedMessages) {
      await messageRepository.updateSyncStatus(message.id, 'pending');
    }

    await syncPendingMessages();
  } catch (error) {
    console.error('[MessageSync] Retry failed:', error);
  }
};

/**
 * Clean up old synced messages to save space
 */
export const cleanupOldMessages = async (daysToKeep: number = 30): Promise<void> => {
  try {
    await messageRepository.deleteOldMessages(daysToKeep);
    console.log(`[MessageSync] Cleaned up messages older than ${daysToKeep} days`);
  } catch (error) {
    console.error('[MessageSync] Cleanup failed:', error);
  }
};
