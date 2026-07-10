// src/design-system/themes/dark.ts

import type { ThemeTokens } from './types';

export const darkTheme: ThemeTokens = {
  colors: {
    // Background - خاکستری تیره
    background: '#1A1A1B',
    foreground: '#F0F0F1',
    
    // Cards
    card: '#262627',
    'card-foreground': '#F0F0F1',
    
    // Popover
    popover: '#262627',
    'popover-foreground': '#F0F0F1',
    
    // Primary - برند (با روشنایی بیشتر)
    primary: '#F56D3C',
    'primary-foreground': '#FFFFFF',
    
    // Secondary - خاکستری متوسط
    secondary: '#333334',
    'secondary-foreground': '#F0F0F1',
    
    // Muted
    muted: '#333334',
    'muted-foreground': '#808081',
    
    // Accent
    accent: '#333334',
    'accent-foreground': '#F0F0F1',
    
    // Destructive
    destructive: '#ef4444',
    'destructive-foreground': '#FFFFFF',
    
    // Borders & Inputs
    border: '#333334',
    input: '#333334',
    ring: '#F56D3C',
    
    // Charts
    'chart-1': '#F56D3C',
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