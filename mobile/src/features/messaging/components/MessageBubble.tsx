import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../../../core/api/types';
import { formatTime } from '../../../shared/utils/formatting';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

/**
 * MessageBubble component displays a single message in the chat
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
}) => {
  const isSystemMessage = message.type === 'system';

  if (isSystemMessage) {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>{message.content}</Text>
        <Text style={styles.systemMessageTime}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer,
      ]}
      accessibilityLabel={`Message from ${isOwnMessage ? 'you' : message.sender?.firstName || 'other user'}`}
    >
      {!isOwnMessage && message.sender && (
        <Text style={styles.senderName}>
          {message.sender.firstName} {message.sender.lastName}
        </Text>
      )}
      <View
        style={[
          styles.bubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText,
          ]}
        >
          {message.content}
        </Text>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.timeText,
              isOwnMessage ? styles.ownTimeText : styles.otherTimeText,
            ]}
          >
            {formatTime(message.createdAt)}
          </Text>
          {isOwnMessage && (
            <Text
              style={styles.readIndicator}
              accessibilityLabel={message.isRead ? 'Message read' : 'Message sent'}
            >
              {message.isRead ? '✓✓' : '✓'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    marginHorizontal: 12,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginLeft: 12,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '100%',
  },
  ownBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timeText: {
    fontSize: 11,
  },
  ownTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherTimeText: {
    color: '#666',
  },
  readIndicator: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  systemMessageContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    maxWidth: '80%',
  },
  systemMessageText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  systemMessageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});
