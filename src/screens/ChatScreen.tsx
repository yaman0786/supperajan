import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Text, Chip, useTheme } from 'react-native-paper';
import Avatar from '../components/Avatar';
import ChatMessageList from '../components/ChatMessageList';
import ChatInput from '../components/ChatInput';
import { Message, AvatarState, UserProfile, EmotionalTone, AvatarConfig } from '../types';
import AIService from '../services/AIService';
import StorageService from '../services/StorageService';
import { isFeatureSupported } from '../utils/platform';

/**
 * ChatScreen - Main conversation interface
 */
const ChatScreen: React.FC = () => {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: '1',
    name: 'Arkadaş',
    preferences: {},
    conversationHistory: [],
    personalData: {},
  });
  const [avatarState, setAvatarState] = useState<AvatarState>({
    expression: 'smile',
    gesture: 'idle',
    lipSyncActive: false,
    emotionalTone: 'neutral',
  });
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>({
    use3D: false, // Default to 2D, can be changed in settings
    fallbackTo2D: true,
    modelPath: undefined, // Path to GLB file when user uploads one
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load conversation history on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const history = await StorageService.loadConversationHistory();
    setMessages(history);
    
    const profile = await StorageService.loadUserProfile();
    if (profile) {
      setUserProfile(profile);
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (isProcessing) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Update avatar to listening state
    setAvatarState(prev => ({
      ...prev,
      gesture: 'listening',
      expression: 'thinking',
    }));

    try {
      // Get AI response
      const response = await AIService.generateResponse(
        text,
        userProfile,
        [...messages, userMessage]
      );

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'assistant',
        timestamp: new Date(),
        emotionalTone: response.emotionalTone,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update avatar state based on emotion
      setAvatarState({
        expression: getExpressionFromTone(response.emotionalTone),
        gesture: 'speaking',
        lipSyncActive: true,
        emotionalTone: response.emotionalTone,
      });

      // Update suggestions
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }

      // Speak the response (simulated)
      await AIService.textToSpeech(response.text, response.emotionalTone);

      // Reset avatar after speaking
      setTimeout(() => {
        setAvatarState(prev => ({
          ...prev,
          lipSyncActive: false,
          gesture: 'idle',
        }));
      }, 2000);

      // Save conversation
      const updatedMessages = [...messages, userMessage, assistantMessage];
      await StorageService.saveConversationHistory(updatedMessages);

    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [messages, userProfile, isProcessing]);

  const handleSuggestionPress = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleVoiceInput = () => {
    // Voice input implementation would go here
    // Only available on mobile platforms
    if (!isFeatureSupported('voice')) {
      console.log('Voice input not supported on this platform');
      return;
    }
    console.log('Voice input triggered');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <Avatar 
          state={avatarState} 
          isAnimating={isProcessing}
          config={avatarConfig}
        />
        <Text
          variant="titleMedium"
          style={[styles.assistantName, { color: theme.colors.onSurface }]}
        >
          Süpperajan
        </Text>
        <Text
          variant="bodySmall"
          style={[styles.status, { color: theme.colors.onSurfaceVariant }]}
        >
          {isProcessing ? 'Düşünüyor...' : 'Seninle konuşmaya hazır'}
        </Text>
      </View>

      {/* Messages */}
      <View style={styles.messagesContainer}>
        <ChatMessageList messages={messages} />
      </View>

      {/* Suggestions */}
      {suggestions.length > 0 && !isProcessing && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.suggestionsContainer}
          contentContainerStyle={styles.suggestionsContent}
        >
          {suggestions.map((suggestion, index) => (
            <Chip
              key={index}
              mode="outlined"
              style={styles.suggestionChip}
              textStyle={{ color: theme.colors.primary }}
              onPress={() => handleSuggestionPress(suggestion)}
            >
              {suggestion}
            </Chip>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        onVoiceInput={handleVoiceInput}
        disabled={isProcessing}
      />
    </KeyboardAvoidingView>
  );
};

const getExpressionFromTone = (tone: EmotionalTone): AvatarState['expression'] => {
  const expressionMap: Record<EmotionalTone, AvatarState['expression']> = {
    happy: 'smile',
    excited: 'excited',
    sad: 'concerned',
    concerned: 'concerned',
    calm: 'neutral',
    neutral: 'neutral',
    empathetic: 'smile',
    supportive: 'smile',
  };
  return expressionMap[tone] || 'neutral';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  assistantName: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  status: {
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  suggestionsContainer: {
    maxHeight: 50,
    marginBottom: 10,
  },
  suggestionsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestionChip: {
    marginHorizontal: 4,
  },
});

export default ChatScreen;
