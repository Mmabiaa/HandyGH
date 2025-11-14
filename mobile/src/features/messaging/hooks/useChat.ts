import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Message } from '../../../core/api/types';

// Simple UUID generator for temporary message IDs
const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
import { messageService } from '../../../core/api/services/MessageService';
import SocketManager, { SocketEvent } from '../../../core/realtime/SocketManager';
import { messageRepository } from '../../../core/storage/database/repositories/MessageRepository';
import { useAuthStore } from '../../../core/store/authStore';
import { syncPendingMessages } from '../utils/messageSync';

interface UseChatOptions {
  bookingId: string;
  enabled?: boolean;
}

interface UseChatReturn {
  messages: Message[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: () => Promise<void>;
  isTyping: boolean;
  isConnected: boolean;
  sendTypingIndicator: () => void;
}

/**
 * Custom hook for chat functionality
 * Handles message fetching, sending, real-time updates, and offline support
 */
export const useChat = ({
  bookingId,
  enabled = true,
}: UseChatOptions): UseChatReturn => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const socketManager = SocketManager.getInstance();

  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(socketManager.isConnected());
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Query key for messages
  const queryKey = ['messages', bookingId];

  // Fetch message history from API
  const {
    data: messages = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      // Try to get from local database first
      const localMessages = await messageRepository.getByBookingId(bookingId);

      // Convert local messages to API format
      const formattedLocalMessages: Message[] = localMessages.map((msg) => ({
        id: msg.id,
        bookingId: msg.bookingId,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        content: msg.content,
        type: msg.type,
        isRead: msg.isRead,
        createdAt: msg.createdAt.toISOString(),
      }));

      // Fetch from API
      try {
        const apiMessages = await messageService.getMessageHistory(bookingId);

        // Store in local database
        await messageRepository.insertBatch(
          apiMessages.map((msg) => ({
            ...msg,
            createdAt: new Date(msg.createdAt),
            syncStatus: 'synced' as const,
          }))
        );

        return apiMessages;
      } catch (error) {
        // If API fails, return local messages
        console.warn('Failed to fetch messages from API, using local cache:', error);
        return formattedLocalMessages;
      }
    },
    enabled,
    staleTime: 0, // Always fetch fresh data
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const tempId = generateTempId();
      const tempMessage: Message = {
        id: tempId,
        bookingId,
        senderId: userId!,
        receiverId: '', // Will be set by backend
        content,
        type: 'text',
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      // Optimistically add to UI
      queryClient.setQueryData<Message[]>(queryKey, (old = []) => [
        ...old,
        tempMessage,
      ]);

      // Store in local database with pending status
      await messageRepository.insert({
        ...tempMessage,
        createdAt: new Date(tempMessage.createdAt),
        syncStatus: 'pending',
      });

      // Send via WebSocket if connected
      if (socketManager.isConnected()) {
        socketManager.emit('message:send', {
          bookingId,
          content,
          type: 'text',
          tempId,
        });
      } else {
        // Fallback to HTTP if WebSocket not connected
        const sentMessage = await messageService.sendMessage({
          bookingId,
          content,
          type: 'text',
        });

        // Update local database with real ID
        await messageRepository.delete(tempId);
        await messageRepository.insert({
          ...sentMessage,
          createdAt: new Date(sentMessage.createdAt),
          syncStatus: 'synced',
        });

        // Update query cache with real message
        queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
          old.map((msg) => (msg.id === tempId ? sentMessage : msg))
        );
      }
    },
  });

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    const unreadMessages = messages.filter(
      (msg) => !msg.isRead && msg.senderId !== userId
    );

    if (unreadMessages.length === 0) return;

    // Optimistically update UI
    queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
      old.map((msg) =>
        msg.senderId !== userId ? { ...msg, isRead: true } : msg
      )
    );

    // Update local database
    await messageRepository.markAllAsReadForBooking(bookingId);

    // Send to server
    try {
      if (socketManager.isConnected()) {
        socketManager.emit(SocketEvent.MESSAGE_READ, {
          bookingId,
          messageIds: unreadMessages.map((msg) => msg.id),
        });
      } else {
        await messageService.markAllAsRead(bookingId);
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  }, [messages, userId, bookingId, queryClient, queryKey, socketManager]);

  // Subscribe to real-time message events
  useEffect(() => {
    if (!enabled) return;

    // Handle new messages
    const unsubscribeMessage = socketManager.subscribe(
      SocketEvent.MESSAGE_RECEIVED,
      async (data: Message) => {
        if (data.bookingId === bookingId) {
          // Add to query cache
          queryClient.setQueryData<Message[]>(queryKey, (old = []) => {
            // Check if message already exists (avoid duplicates)
            if (old.some((msg) => msg.id === data.id)) {
              return old;
            }
            return [...old, data];
          });

          // Store in local database
          await messageRepository.insert({
            ...data,
            createdAt: new Date(data.createdAt),
            syncStatus: 'synced',
          });

          // Auto-mark as read if from other user
          if (data.senderId !== userId) {
            setTimeout(() => markAsRead(), 500);
          }
        }
      }
    );

    // Handle typing indicator
    const unsubscribeTyping = socketManager.subscribe(
      SocketEvent.MESSAGE_TYPING,
      (data: { bookingId: string; userId: string; isTyping: boolean }) => {
        if (data.bookingId === bookingId && data.userId !== userId) {
          setIsTyping(data.isTyping);

          // Clear typing indicator after 3 seconds
          if (data.isTyping) {
            if (typingTimeoutRef.current) {
              clearTimeout(typingTimeoutRef.current);
            }
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
            }, 3000);
          }
        }
      }
    );

    // Handle message read receipts
    const unsubscribeRead = socketManager.subscribe(
      SocketEvent.MESSAGE_READ,
      (data: { bookingId: string; messageIds: string[] }) => {
        if (data.bookingId === bookingId) {
          queryClient.setQueryData<Message[]>(queryKey, (old = []) =>
            old.map((msg) =>
              data.messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
            )
          );
        }
      }
    );

    // Monitor connection status
    const unsubscribeStatus = socketManager.onStatusChange((status) => {
      const wasDisconnected = !isConnected;
      const isNowConnected = status === 'connected';

      setIsConnected(isNowConnected);

      // Sync pending messages when reconnecting
      if (wasDisconnected && isNowConnected) {
        console.log('[useChat] Connection restored, syncing pending messages');
        syncPendingMessages().catch((error) => {
          console.error('[useChat] Failed to sync pending messages:', error);
        });
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeRead();
      unsubscribeStatus();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [enabled, bookingId, userId, queryClient, queryKey, socketManager, markAsRead]);

  // Send typing indicator
  const sendTypingIndicator = useCallback(() => {
    if (socketManager.isConnected()) {
      socketManager.emit(SocketEvent.MESSAGE_TYPING, {
        bookingId,
        isTyping: true,
      });
    }
  }, [bookingId, socketManager]);

  return {
    messages,
    isLoading,
    isError,
    error: error as Error | null,
    sendMessage: sendMessageMutation.mutateAsync,
    markAsRead,
    isTyping,
    isConnected,
    sendTypingIndicator,
  };
};
