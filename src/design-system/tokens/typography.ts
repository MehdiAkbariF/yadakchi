export const fontFamily = {
  sans: ['var(-- )', 'system-ui', 'sans-serif'],
  mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
} as const;

export const fontSize = {
  '2xs': ['11px', { lineHeight: '1.6' }],
  xs:    ['12px', { lineHeight: '1.7' }],
  sm:    ['13px', { lineHeight: '1.75' }],
  base:  ['14px', { lineHeight: '1.9' }],
  md:    ['15px', { lineHeight: '2' }],
  lg:    ['16px', { lineHeight: '1.85' }],
  xl:    ['18px', { lineHeight: '1.7' }],
  '2xl': ['20px', { lineHeight: '1.6' }],
  '3xl': ['24px', { lineHeight: '1.5' }],
  '4xl': ['28px', { lineHeight: '1.4' }],
  '5xl': ['32px', { lineHeight: '1.3' }],
  '6xl': ['40px', { lineHeight: '1.2' }],
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