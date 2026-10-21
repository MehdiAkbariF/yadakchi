import type { lightTheme } from './light';

export type Theme = typeof lightTheme;
export type ThemeKey = keyof Theme;