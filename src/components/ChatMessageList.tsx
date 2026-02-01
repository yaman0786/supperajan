import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import { Message } from '../types';
import { format } from 'date-fns';

interface ChatMessageListProps {
  messages: Message[];
}

/**
 * ChatMessageList Component
 * Displays conversation history with Material Design styling
 */
const ChatMessageList: React.FC<ChatMessageListProps> = ({ messages }) => {
  const theme = useTheme();

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        ]}
      >
        <Surface
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser
                ? theme.colors.primary
                : theme.colors.surface,
            },
          ]}
          elevation={2}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? '#FFFFFF' : theme.colors.onSurface },
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.timestamp,
              { color: isUser ? 'rgba(255,255,255,0.7)' : theme.colors.onSurfaceVariant },
            ]}
          >
            {format(new Date(item.timestamp), 'HH:mm')}
          </Text>
        </Surface>
        
        {item.emotionalTone && !isUser && (
          <Text style={styles.emotionalIndicator}>
            {getEmotionalEmoji(item.emotionalTone)}
          </Text>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      inverted={false}
      showsVerticalScrollIndicator={false}
    />
  );
};

const getEmotionalEmoji = (tone: string): string => {
  const emojiMap: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    excited: '🤩',
    calm: '😌',
    concerned: '😟',
    neutral: '🤖',
    empathetic: '🤗',
    supportive: '💪',
  };
  return emojiMap[tone] || '🤖';
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  messageContainer: {
    marginVertical: 8,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
  },
  emotionalIndicator: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default ChatMessageList;
