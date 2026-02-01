/**
 * Web-compatible AsyncStorage adapter
 * Uses localStorage for web platform
 */

import { Platform } from 'react-native';

class WebStorage {
  async getItem(key: string): Promise<string | null> {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      keys.forEach(key => window.localStorage.removeItem(key));
    }
  }

  async clear(): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  }

  async getAllKeys(): Promise<string[]> {
    if (typeof window !== 'undefined' && window.localStorage) {
      return Object.keys(window.localStorage);
    }
    return [];
  }
}

// Export appropriate storage implementation based on platform
let AsyncStorage: any;

if (Platform.OS === 'web') {
  AsyncStorage = new WebStorage();
} else {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

export default AsyncStorage;
