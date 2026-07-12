// src/design-system/themes/dark.ts

import type { ThemeTokens } from './types';

export const darkTheme: ThemeTokens = {
  colors: {
    // اصلاح کلیدی پس‌زمینه و رنگ‌های جلو رونده تم دارک با استاندارد زینک عمیق
    background: '#09090B',
    foreground: '#FAFAFA',
    
    // کارت‌ها تفکیک کامل با پله فرعی تراز شده
    card: '#111113',
    'card-foreground': '#FAFAFA',
    
    popover: '#111113',
    'popover-foreground': '#FAFAFA',
    
    primary: '#F56D3C',
    'primary-foreground': '#FFFFFF',
    
    secondary: '#27272A',
    'secondary-foreground': '#FAFAFA',
    
    muted: '#27272A',
    'muted-foreground': '#A1A1AA',
    
    accent: '#27272A',
    'accent-foreground': '#FAFAFA',
    
    destructive: '#ef4444',
    'destructive-foreground': '#FFFFFF',
    
    border: '#27272A',
    input: '#27272A',
    ring: '#F56D3C',
    
    // نمودارها
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
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.5)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.6), 0 2px 4px -2px rgb(0 0 0 / 0.6)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.6), 0 4px 6px -4px rgb(0 0 0 / 0.6)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.6)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.7)',
  },
};

export type DarkTheme = typeof darkTheme;