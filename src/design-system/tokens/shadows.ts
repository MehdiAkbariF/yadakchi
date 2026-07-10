// src/design-system/tokens/shadows.ts

export const shadows = {
  xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
} as const;

export const dropShadows = {
  sm: '0 1px 1px rgb(0 0 0 / 0.05)',
  md: '0 4px 3px rgb(0 0 0 / 0.07)',
  lg: '0 10px 8px rgb(0 0 0 / 0.04)',
  xl: '0 20px 13px rgb(0 0 0 / 0.03)',
  '2xl': '0 25px 25px rgb(0 0 0 / 0.15)',
  none: '0 0 #0000',
} as const;