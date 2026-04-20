import type { Config } from 'tailwindcss';
import { colors, typography, spacing, borderRadius, shadows, animation } from '@supperajan/ui/tokens';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: colors.primary,
        accent: colors.accent,
        bg: colors.background,
        neutral: colors.neutral,
        status: colors.status,
        avatar: colors.avatar,
        voice: colors.voice,
      },
      fontFamily: {
        sans: typography.fontFamily.sans.split(',').map((f) => f.trim().replace(/"/g, '')),
        mono: typography.fontFamily.mono.split(',').map((f) => f.trim().replace(/"/g, '')),
      },
      boxShadow: shadows,
      animation: {
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'blink': 'blink 0.15s ease-in-out',
        'chest-pulse': 'chestPulse 1s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'typing': 'typing 1.2s ease-in-out infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(0, 191, 255, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 191, 255, 0.7)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        blink: {
          '0%': { scaleY: '1' },
          '50%': { scaleY: '0.05' },
          '100%': { scaleY: '1' },
        },
        chestPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
