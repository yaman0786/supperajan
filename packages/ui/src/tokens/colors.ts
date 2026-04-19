/**
 * Design token system anchored to the Süpperajan robot visual identity.
 * Orange metallic body, glowing blue eyes/chest, dark futuristic backgrounds.
 */

export const colors = {
  // Primary brand — robot body orange
  primary: {
    50: '#FFF3E8',
    100: '#FFE0C0',
    200: '#FFC090',
    300: '#FF9F5A',
    400: '#FF8030',
    500: '#E8611A', // Main brand
    600: '#C94E10',
    700: '#A33C0A',
    800: '#7D2D06',
    900: '#4F1C03',
  },
  // Accent — eye and chest glow blue
  accent: {
    50: '#E8F8FF',
    100: '#BAF0FF',
    200: '#80E4FF',
    300: '#3DD4FF',
    400: '#00C4FF',
    500: '#00AEDE', // Main accent
    600: '#0090BA',
    700: '#007096',
    800: '#00506E',
    900: '#003248',
  },
  // Background dark palette
  background: {
    base: '#0A0C10',
    surface: '#10141C',
    elevated: '#161C28',
    overlay: '#1E2636',
    border: '#252E40',
    borderStrong: '#2E3A50',
  },
  // Neutral grays for text and UI
  neutral: {
    50: '#F8FAFC',
    100: '#EEF2F7',
    200: '#D8E0ED',
    300: '#BAC6DC',
    400: '#8F9EBA',
    500: '#637596',
    600: '#465572',
    700: '#2F3D54',
    800: '#1E2838',
    900: '#111827',
  },
  // Status colors
  status: {
    success: '#22C55E',
    successLight: '#DCFCE7',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',
  },
  // Special avatar colors
  avatar: {
    eyeGlow: '#00BFFF',
    chestLight: '#00BFFF',
    bodyOrange: '#E8611A',
    bodyOrangeDark: '#C94E10',
    bodyOrangeLight: '#FF8030',
    metalSheen: '#8B6A3E',
    shadow: 'rgba(0, 0, 0, 0.6)',
    glowHalo: 'rgba(0, 191, 255, 0.15)',
  },
  // Voice activity indicator colors
  voice: {
    idle: '#637596',
    listening: '#00BFFF',
    speaking: '#E8611A',
    processing: '#F59E0B',
  },
} as const;

export type Colors = typeof colors;
