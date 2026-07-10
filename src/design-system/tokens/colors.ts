// src/design-system/tokens/colors.ts

export const colors = {
  // Brand Primary Colors
  brand: {
    50: '#FDE8E3',
    100: '#FCD1C7',
    200: '#FAA3AB',
    300: '#F8758F',
    400: '#F64773',
    500: '#F56D3C', // رنگ اصلی برند
    600: '#D95D32',
    700: '#BD4D28',
    800: '#A13D1E',
    900: '#852D14',
    950: '#691D0A',
  },
  
  // Neutral Colors
  neutral: {
    50: '#FFFFFF', // سفید
    100: '#FCFCFC',
    200: '#F8F8F8',
    300: '#F0F0F1', // خاکستری روشن
    400: '#E0E0E1',
    500: '#C0C0C1',
    600: '#A0A0A1',
    700: '#808081',
    800: '#606061',
    900: '#404041',
    950: '#202021',
  },
  
  // Primary (همان برند)
  primary: {
    DEFAULT: '#F56D3C',
    foreground: '#FFFFFF',
    50: '#FDE8E3',
    100: '#FCD1C7',
    200: '#FAA3AB',
    300: '#F8758F',
    400: '#F64773',
    500: '#F56D3C',
    600: '#D95D32',
    700: '#BD4D28',
    800: '#A13D1E',
    900: '#852D14',
    950: '#691D0A',
  },
  
  // Secondary
  secondary: {
    DEFAULT: '#F0F0F1',
    foreground: '#202021',
    50: '#FFFFFF',
    100: '#FCFCFC',
    200: '#F8F8F8',
    300: '#F0F0F1',
    400: '#E0E0E1',
    500: '#C0C0C1',
    600: '#A0A0A1',
    700: '#808081',
    800: '#606061',
    900: '#404041',
    950: '#202021',
  },
  
  // Success Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning Colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error Colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
} as const;

export type ColorToken = typeof colors;
export type ColorKey = keyof typeof colors;