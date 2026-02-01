import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Text,
  List,
  Switch,
  Button,
  TextInput,
  Divider,
  useTheme,
} from 'react-native-paper';
import StorageService from '../services/StorageService';

/**
 * SettingsScreen - Personalization and configuration
 */
const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const [userName, setUserName] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emotionalAnalysis, setEmotionalAnalysis] = useState(true);
  const [dataLearning, setDataLearning] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    const preferences = await StorageService.loadPreferences();
    setUserName(preferences.userName || '');
    setVoiceEnabled(preferences.voiceEnabled ?? true);
    setNotificationsEnabled(preferences.notificationsEnabled ?? true);
    setEmotionalAnalysis(preferences.emotionalAnalysis ?? true);
    setDataLearning(preferences.dataLearning ?? true);
  };

  const savePreferences = async () => {
    const preferences = {
      userName,
      voiceEnabled,
      notificationsEnabled,
      emotionalAnalysis,
      dataLearning,
    };
    await StorageService.savePreferences(preferences);
    
    // Update user profile
    const profile = await StorageService.loadUserProfile();
    if (profile) {
      profile.name = userName || profile.name;
      await StorageService.saveUserProfile(profile);
    }
  };

  const handleClearData = async () => {
    await StorageService.clearAllData();
    setUserName('');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.section}>
        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Kişiselleştirme
        </Text>
        
        <TextInput
          label="İsminiz"
          value={userName}
          onChangeText={setUserName}
          mode="outlined"
          style={styles.input}
        />
      </View>

      <Divider />

      <View style={styles.section}>
        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Özellikler
        </Text>

        <List.Item
          title="Sesli Yanıtlar"
          description="Asistanın sesli yanıt vermesini sağlar"
          left={props => <List.Icon {...props} icon="volume-high" />}
          right={() => (
            <Switch
              value={voiceEnabled}
              onValueChange={setVoiceEnabled}
            />
          )}
        />

        <List.Item
          title="Bildirimler"
          description="Hatırlatma ve önemli bildirimleri alın"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
            />
          )}
        />

        <List.Item
          title="Duygusal Analiz"
          description="Duygusal durumunuza göre yanıt verir"
          left={props => <List.Icon {...props} icon="heart" />}
          right={() => (
            <Switch
              value={emotionalAnalysis}
              onValueChange={setEmotionalAnalysis}
            />
          )}
        />

        <List.Item
          title="Kişisel Veri Öğrenme"
          description="Sizden öğrenerek daha iyi yanıtlar verir"
          left={props => <List.Icon {...props} icon="brain" />}
          right={() => (
            <Switch
              value={dataLearning}
              onValueChange={setDataLearning}
            />
          )}
        />
      </View>

      <Divider />

      <View style={styles.section}>
        <Text variant="headlineSmall" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Hakkında
        </Text>
        
        <List.Item
          title="Versiyon"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
        />

        <List.Item
          title="Süpperajan"
          description="Yapay zeka tabanlı empatik asistan"
          left={props => <List.Icon {...props} icon="robot" />}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={savePreferences}
          style={styles.button}
        >
          Ayarları Kaydet
        </Button>

        <Button
          mode="outlined"
          onPress={handleClearData}
          style={styles.button}
          textColor={theme.colors.error}
        >
          Tüm Verileri Temizle
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 8,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
});

export default SettingsScreen;
