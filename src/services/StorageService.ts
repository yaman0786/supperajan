import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, Message, Reminder } from '../types';

/**
 * Storage Service - Handles data persistence and learning
 */
class StorageService {
  private readonly KEYS = {
    USER_PROFILE: '@supperajan_user_profile',
    CONVERSATION_HISTORY: '@supperajan_conversation_history',
    REMINDERS: '@supperajan_reminders',
    PREFERENCES: '@supperajan_preferences',
  };

  /**
   * Saves user profile
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  /**
   * Loads user profile
   */
  async loadUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  /**
   * Saves conversation history
   */
  async saveConversationHistory(messages: Message[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.KEYS.CONVERSATION_HISTORY,
        JSON.stringify(messages)
      );
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }

  /**
   * Loads conversation history
   */
  async loadConversationHistory(): Promise<Message[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.CONVERSATION_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading conversation history:', error);
      return [];
    }
  }

  /**
   * Saves reminders
   */
  async saveReminders(reminders: Reminder[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminders:', error);
    }
  }

  /**
   * Loads reminders
   */
  async loadReminders(): Promise<Reminder[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.REMINDERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading reminders:', error);
      return [];
    }
  }

  /**
   * Saves user preferences
   */
  async savePreferences(preferences: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.KEYS.PREFERENCES,
        JSON.stringify(preferences)
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }

  /**
   * Loads user preferences
   */
  async loadPreferences(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.PREFERENCES);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading preferences:', error);
      return {};
    }
  }

  /**
   * Clears all data
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(this.KEYS));
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export default new StorageService();
