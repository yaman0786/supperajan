import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

// Custom theme with blue neon accents and futuristic design
export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#00BFFF', // Blue neon
    secondary: '#4169E1', // Royal blue
    tertiary: '#1E90FF', // Dodger blue
    background: '#0A0E27', // Dark futuristic background
    surface: '#1A1F3A', // Dark surface
    surfaceVariant: '#252A47',
    onSurface: '#E8E8E8',
    onSurfaceVariant: '#C0C0C0',
    error: '#FF4444',
    onError: '#FFFFFF',
    outline: '#00BFFF',
    elevation: {
      level0: 'transparent',
      level1: '#1A1F3A',
      level2: '#252A47',
      level3: '#2F3555',
      level4: '#394063',
      level5: '#434B71',
    },
  },
  // Custom properties for avatar and UI
  custom: {
    neonBlue: '#00BFFF',
    neonPink: '#FF1493',
    metallicGray: '#708090',
    avatarGlow: 'rgba(0, 191, 255, 0.6)',
    cardElevation: 4,
    borderRadius: 16,
  },
};

export type AppTheme = typeof theme;
