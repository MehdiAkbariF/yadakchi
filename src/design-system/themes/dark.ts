// src/design-system/themes/dark.ts

import type { ThemeTokens } from './types';

export const darkTheme: ThemeTokens = {
  colors: {
    background: '#0f172a',
    foreground: '#f8fafc',
    card: '#1e293b',
    'card-foreground': '#f8fafc',
    popover: '#1e293b',
    'popover-foreground': '#f8fafc',
    primary: '#38bdf8',
    'primary-foreground': '#0f172a',
    secondary: '#1e293b',
    'secondary-foreground': '#f8fafc',
    muted: '#1e293b',
    'muted-foreground': '#94a3b8',
    accent: '#1e293b',
    'accent-foreground': '#f8fafc',
    destructive: '#ef4444',
    'destructive-foreground': '#f8fafc',
    border: '#1e293b',
    input: '#1e293b',
    ring: '#38bdf8',
    'chart-1': '#38bdf8',
    'chart-2': '#4ade80',
    'chart-3': '#fbbf24',
    'chart-4': '#f87171',
    'chart-5': '#a78bfa',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.5)',
  },
};

export type DarkTheme = typeof darkTheme;