import { Platform } from 'react-native';

/**
 * Platform utilities for multi-platform support
 */

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isMacOS = Platform.OS === 'macos';
export const isMobile = isIOS || isAndroid;
export const isDesktop = isWeb || isMacOS;

/**
 * Get platform-specific value
 */
export const selectPlatform = <T,>(platforms: {
  web?: T;
  ios?: T;
  android?: T;
  macos?: T;
  mobile?: T;
  desktop?: T;
  default: T;
}): T => {
  // Check specific platforms first
  if (isWeb && platforms.web !== undefined) return platforms.web;
  if (isIOS && platforms.ios !== undefined) return platforms.ios;
  if (isAndroid && platforms.android !== undefined) return platforms.android;
  if (isMacOS && platforms.macos !== undefined) return platforms.macos;
  
  // Check platform groups
  if (isMobile && platforms.mobile !== undefined) return platforms.mobile;
  if (isDesktop && platforms.desktop !== undefined) return platforms.desktop;
  
  // Return default
  return platforms.default;
};

/**
 * Check if feature is supported on current platform
 */
export const isFeatureSupported = (feature: string): boolean => {
  const unsupportedFeatures: Record<string, string[]> = {
    'voice': ['web'],
    'tts': ['web'],
    '3d-avatar': [], // Supported on all platforms
    'haptics': ['web'],
  };

  const unsupported = unsupportedFeatures[feature] || [];
  return !unsupported.includes(Platform.OS);
};

/**
 * Get responsive dimensions based on platform
 */
export const getResponsiveDimensions = () => {
  if (isWeb) {
    return {
      maxWidth: 1200,
      isMobileView: window.innerWidth < 768,
      isTabletView: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktopView: window.innerWidth >= 1024,
    };
  }
  
  return {
    maxWidth: undefined,
    isMobileView: isMobile,
    isTabletView: false,
    isDesktopView: isDesktop,
  };
};
