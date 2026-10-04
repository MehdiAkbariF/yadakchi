// src/design-system/tokens/typography.ts

/**
 * ✍️ YADAKCHI TYPOGRAPHY SYSTEM v2.0
 * 
 * ساختار:
 * - display: برای Hero و Landing (خیلی بزرگ)
 * - heading: تیترهای صفحه و بخش‌ها
 * - body: متن اصلی
 * - label: برچسب فرم‌ها
 * - code: کد
 * 
 * نکات:
 * - line-height برای فارسی بزرگ‌تر از انگلیسی (حداقل ۱.۷ برای body)
 * - letter-spacing منفی برای تیترهای بزرگ (بهتر می‌شن)
 * - وزن فونت IRANYekan: 100, 300, 400, 500, 700, 800, 900
 */

// ═══════════════════════════════════════════════
// 📐 TYPE SCALE
// ═══════════════════════════════════════════════

export const typography = {
  // ─── DISPLAY (Landing, Hero) ───
  display: {
    '2xl': {
      fontSize: '4.5rem',      // 72px
      lineHeight: '1.05',
      fontWeight: '900',
      letterSpacing: '-0.03em',
    },
    'xl': {
      fontSize: '3.75rem',     // 60px
      lineHeight: '1.05',
      fontWeight: '900',
      letterSpacing: '-0.025em',
    },
    'lg': {
      fontSize: '3rem',        // 48px
      lineHeight: '1.1',
      fontWeight: '800',
      letterSpacing: '-0.02em',
    },
    'md': {
      fontSize: '2.5rem',      // 40px
      lineHeight: '1.15',
      fontWeight: '800',
      letterSpacing: '-0.02em',
    },
  },

  // ─── HEADING (تیترها) ───
  heading: {
    h1: {
      fontSize: '2.25rem',     // 36px
      lineHeight: '1.25',
      fontWeight: '800',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.875rem',    // 30px
      lineHeight: '1.3',
      fontWeight: '800',
      letterSpacing: '-0.015em',
    },
    h3: {
      fontSize: '1.5rem',      // 24px
      lineHeight: '1.35',
      fontWeight: '700',
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',     // 20px
      lineHeight: '1.4',
      fontWeight: '700',
      letterSpacing: '-0.005em',
    },
    h5: {
      fontSize: '1.125rem',    // 18px
      lineHeight: '1.45',
      fontWeight: '700',
    },
    h6: {
      fontSize: '1rem',        // 16px
      lineHeight: '1.5',
      fontWeight: '600',
    },
  },

  // ─── BODY (متن اصلی) ───
  body: {
    xl: {
      fontSize: '1.125rem',    // 18px
      lineHeight: '1.75',
      fontWeight: '400',
    },
    lg: {
      fontSize: '1rem',        // 16px
      lineHeight: '1.75',
      fontWeight: '400',
    },
    md: {
      fontSize: '0.875rem',    // 14px
      lineHeight: '1.7',
      fontWeight: '400',
    },
    sm: {
      fontSize: '0.8125rem',   // 13px
      lineHeight: '1.65',
      fontWeight: '400',
    },
    xs: {
      fontSize: '0.75rem',     // 12px
      lineHeight: '1.6',
      fontWeight: '400',
    },
  },

  // ─── LABEL (برچسب‌ها) ───
  label: {
    lg: {
      fontSize: '0.9375rem',   // 15px
      lineHeight: '1.5',
      fontWeight: '500',
    },
    md: {
      fontSize: '0.875rem',    // 14px
      lineHeight: '1.5',
      fontWeight: '500',
    },
    sm: {
      fontSize: '0.75rem',     // 12px
      lineHeight: '1.5',
      fontWeight: '500',
    },
  },

  // ─── OVERLINE (بالای تیتر) ───
  overline: {
    md: {
      fontSize: '0.75rem',
      lineHeight: '1.5',
      fontWeight: '700',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
  },

  // ─── CODE ───
  code: {
    md: {
      fontSize: '0.875rem',
      lineHeight: '1.6',
      fontFamily: 'mono',
    },
  },
} as const;

// ═══════════════════════════════════════════════
// 🔤 FONT FAMILIES
// ═══════════════════════════════════════════════

export const fontFamily = {
  // فونت اصلی — همه‌جا
  sans: [
    'IRANYekan',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'sans-serif',
  ],
  
  // فونت نمایشی — برای لوگو و موارد خاص
  display: [
    'IRANYekan',
    'system-ui',
    'sans-serif',
  ],
  
  // فونت تک‌عرض — برای کد، شناسه‌ها
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    'monospace',
  ],
  
  // ─── پیشنهاد برای آینده ───
  // اگر خواستید فونت انگلیسی هم داشته باشید (برای اعداد و لاتین):
  latin: [
    'Inter',
    'system-ui',
    'sans-serif',
  ],
} as const;

// ═══════════════════════════════════════════════
// ⚖️ FONT WEIGHTS
// ═══════════════════════════════════════════════

export const fontWeight = {
  thin: '100',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
} as const;

// ═══════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════

export const typographyTokens = {
  typography,
  fontFamily,
  fontWeight,
} as const;

// ─── export قدیمی برای سازگاری ───
export const legacyTypography = {
  fontFamily: {
    sans: ['var(--font-iran-yekan)', 'system-ui', 'sans-serif'],
    yekan: ['var(--font-iran-yekan)', 'system-ui', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }],
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

export type TypographyTokens = typeof typographyTokens;