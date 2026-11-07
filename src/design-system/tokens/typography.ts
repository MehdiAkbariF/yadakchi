// src/design-system/tokens/typography.ts
// همگام با tailwind.config.js fontSize.
// fontFamily از CSS var میاد، نه آرایه‌ی خراب.

export const fontFamily = {
  sans: ['var(--font-sans, IRANYekan)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-mono, ui-monospace)', 'SFMono-Regular', 'monospace'],
} as const;

export const fontSize = {
  '3xs': ['0.625rem', { lineHeight: '1.5' }],
  '2xs': ['0.6875rem', { lineHeight: '1.6' }],
  xs:    ['0.75rem', { lineHeight: '1.7' }],
  sm:    ['0.8125rem', { lineHeight: '1.75' }],
  base:  ['0.875rem', { lineHeight: '1.9' }],
  md:    ['0.9375rem', { lineHeight: '2' }],
  lg:    ['1rem', { lineHeight: '1.85' }],
  xl:    ['1.125rem', { lineHeight: '1.7' }],
  '2xl': ['1.25rem', { lineHeight: '1.6' }],
  '3xl': ['1.5rem', { lineHeight: '1.5' }],
  '4xl': ['1.75rem', { lineHeight: '1.4' }],
  '5xl': ['2rem', { lineHeight: '1.3' }],
  '6xl': ['2.5rem', { lineHeight: '1.2' }],
} as const;

export const fontWeight = {
  normal:   '400',
  medium:   '500',
  semibold: '600',
  bold:     '700',
} as const;

export const letterSpacing = {
  tight:  '-0.01em',
  normal: '0',
  wide:   '0.02em',
} as const;

export const lineHeight = {
  reading: '2.15',
} as const;

export type FontSizeKey = keyof typeof fontSize;
export type FontWeightKey = keyof typeof fontWeight;