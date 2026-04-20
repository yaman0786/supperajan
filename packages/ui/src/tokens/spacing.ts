export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  56: '14rem',
  64: '16rem',
} as const;

export const borderRadius = {
  none: '0',
  sm: '0.25rem',
  DEFAULT: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
  DEFAULT: '0 2px 8px 0 rgba(0, 0, 0, 0.5)',
  md: '0 4px 16px 0 rgba(0, 0, 0, 0.5)',
  lg: '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
  xl: '0 16px 48px 0 rgba(0, 0, 0, 0.7)',
  glow: '0 0 20px rgba(0, 191, 255, 0.3)',
  glowOrange: '0 0 20px rgba(232, 97, 26, 0.4)',
  glowBlue: '0 0 30px rgba(0, 191, 255, 0.5)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.4)',
} as const;

export const animation = {
  duration: {
    instant: '50ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '750ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;
