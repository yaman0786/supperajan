import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton, useTheme, Surface } from 'react-native-paper';
import { isFeatureSupported } from '../utils/platform';

interface ChatInputProps {
  onSend: (message: string) => void;
  onVoiceInput?: () => void;
  disabled?: boolean;
}

/**
 * ChatInput Component
 * Material Design input with voice and text capabilities
 * Voice input only available on supported platforms
 */
const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  onVoiceInput,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const theme = useTheme();
  const voiceSupported = isFeatureSupported('voice');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <Surface style={styles.container} elevation={4}>
      <View style={styles.inputContainer}>
        {onVoiceInput && voiceSupported && (
          <IconButton
            icon="microphone"
            size={24}
            iconColor={theme.colors.primary}
            onPress={onVoiceInput}
            disabled={disabled}
          />
        )}
        
        <TextInput
          style={styles.input}
          mode="outlined"
          placeholder="Mesajınızı yazın..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={handleSend}
          multiline
          maxLength={500}
          disabled={disabled}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
          textColor={theme.colors.onSurface}
        />
        
        <IconButton
          icon="send"
          size={24}
          iconColor={theme.colors.primary}
          onPress={handleSend}
          disabled={disabled || !message.trim()}
        />
      </View>
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    maxHeight: 100,
  },
});

export default ChatInput;
