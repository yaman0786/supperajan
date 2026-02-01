import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { theme } from './config/theme';
import ChatScreen from './screens/ChatScreen';
import RemindersScreen from './screens/RemindersScreen';
import SettingsScreen from './screens/SettingsScreen';
import { isWeb, getResponsiveDimensions } from './utils/platform';

const Tab = createBottomTabNavigator();

/**
 * Main App Component
 * Sets up navigation, theme, and providers
 * Supports Web, iOS, Android, and macOS platforms
 */
const App: React.FC = () => {
  const dimensions = getResponsiveDimensions();

  const AppContent = (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.outline,
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab.Screen
            name="Sohbet"
            component={ChatScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="chat" size={size} color={color} />
              ),
              headerTitle: 'Süpperajan',
            }}
          />
          <Tab.Screen
            name="Hatırlatmalar"
            component={RemindersScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="bell" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Ayarlar"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="cog" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );

  // Wrap with SafeAreaProvider for all platforms
  // For web, add responsive container
  if (isWeb && dimensions.maxWidth) {
    return (
      <SafeAreaProvider>
        <View style={styles.webContainer}>
          <View style={[styles.webContent, { maxWidth: dimensions.maxWidth }]}>
            {AppContent}
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      {AppContent}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  webContent: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
  },
});

export default App;
