// src/design-system/themes/light.ts

import type { ThemeTokens } from './types';

export const lightTheme: ThemeTokens = {
  colors: {
    // Background
    background: '#FFFFFF',
    foreground: '#202021',
    
    // Cards
    card: '#FFFFFF',
    'card-foreground': '#202021',
    
    // Popover
    popover: '#FFFFFF',
    'popover-foreground': '#202021',
    
    // Primary - برند
    primary: '#F56D3C',
    'primary-foreground': '#FFFFFF',
    
    // Secondary - خاکستری روشن
    secondary: '#F0F0F1',
    'secondary-foreground': '#202021',
    
    // Muted
    muted: '#F0F0F1',
    'muted-foreground': '#808081',
    
    // Accent
    accent: '#F0F0F1',
    'accent-foreground': '#202021',
    
    // Destructive
    destructive: '#ef4444',
    'destructive-foreground': '#FFFFFF',
    
    // Borders & Inputs
    border: '#E0E0E1',
    input: '#E0E0E1',
    ring: '#F56D3C',
    
    // Charts
    'chart-1': '#F56D3C',
    'chart-2': '#22c55e',
    'chart-3': '#f59e0b',
    'chart-4': '#ef4444',
    'chart-5': '#8b5cf6',
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
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
};

export type LightTheme = typeof lightTheme;