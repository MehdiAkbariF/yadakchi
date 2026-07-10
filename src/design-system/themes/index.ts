// src/design-system/themes/index.ts

export * from './types';
export * from './light';
export * from './dark';

export type ThemeMode = 'light' | 'dark';

import { lightTheme } from './light';
import { darkTheme } from './dark';
import type { ThemeTokens } from './types';

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type Theme = ThemeTokens;

// Helper function to get theme
export function getTheme(mode: ThemeMode): Theme {
  return themes[mode];
}

// Helper function to get current theme based on system preference
export function getSystemTheme(): ThemeMode {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}