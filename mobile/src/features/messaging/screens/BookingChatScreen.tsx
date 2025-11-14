import React, { useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInput } from '../components/ChatInput';
import { TypingIndicator } from '../components/TypingIndicator';
import { useChat } from '../hooks/useChat';
import { useAuthStore } from '../../../core/store/authStore';
import { Message } from '../../../core/api/types';

type RootStackParamList = {
  BookingChat: { bookingId: string; providerName?: string; customerName?: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'BookingChat'>;

/**
 * BookingChatScreen - Real-time messaging for bookings
 * Implements Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9
 */
export const BookingChatScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId, providerName, customerName } = route.params;
  const userId = useAuthStore((state) => state.user?.id);
  const userRole = useAuthStore((state) => state.user?.role);
  const flatListRef = useRef<FlatList>(null);

  const {
    messages,
    isLoading,
    isError,
    error,
    sendMessage,
    markAsRead,
    isTyping,
    isConnected,
    sendTypingIndicator,
  } = useChat({ bookingId });

  // Set header title
  useEffect(() => {
    const otherUserName =
      userRole === 'customer' ? providerName : customerName;

    navigation.setOptions({
      title: otherUserName || 'Chat',
      headerRight: () => (
        <View style={styles.headerRight}>
          <View
            style={[
              styles.connectionIndicator,
              isConnected ? styles.connected : styles.disconnected,
            ]}
            accessibilityLabel={isConnected ? 'Connected' : 'Disconnected'}
          />
        </View>
      ),
    });
  }, [navigation, providerName, customerName, userRole, isConnected]);

  // Mark messages as read when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      markAsRead();
    });

    return unsubscribe;
  }, [navigation, markAsRead]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      // TODO: Show error toast
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.senderId === userId;
    return <MessageBubble message={item} isOwnMessage={isOwnMessage} />;
  };

  const renderFooter = () => {
    if (!isTyping) return null;

    const otherUserName =
      userRole === 'customer'
        ? providerName || 'Provider'
        : customerName || 'Customer';

    return <TypingIndicator userName={otherUserName} />;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centerContainer}>
          <MaterialIcons name="error-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>Failed to load messages</Text>
          <Text style={styles.errorSubtext}>
            {error?.message || 'Please try again'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              // Retry logic handled by React Query
            }}
            accessibilityLabel="Retry loading messages"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="chat-bubble-outline" size={64} color="#CCC" />
        <Text style={styles.emptyText}>No messages yet</Text>
        <Text style={styles.emptySubtext}>
          Start the conversation by sending a message
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messageList,
          messages.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
      />
      <ChatInput
        onSend={handleSendMessage}
        onTyping={sendTypingIndicator}
        disabled={!isConnected}
        placeholder={
          isConnected
            ? 'Type a message...'
            : 'Connecting...'
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRight: {
    marginRight: 16,
  },
  connectionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  connected: {
    backgroundColor: '#34C759',
  },
  disconnected: {
    backgroundColor: '#FF3B30',
  },
  messageList: {
    paddingVertical: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
