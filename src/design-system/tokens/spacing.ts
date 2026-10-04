// src/design-system/tokens/spacing.ts

/**
 * 📏 YADAKCHI SPACING SYSTEM v2.0
 * 
 * قواعد:
 * ۱. همه فاصله‌ها مضرب ۴ پیکسل هستن (۴pt grid)
 * ۲. نام‌گذاری معنایی (نه عددی)
 * ۳. برای gap، padding، margin استفاده می‌شه
 * 
 * مقیاس:
 * 3xs →  2px  (خیلی ریز — border offset)
 * 2xs →  4px  (ریز — gap badge)
 * xs  →  8px  (کوچک — gap آیکون و متن)
 * sm  → 12px  (متوسط-کوچک — padding button)
 * md  → 16px  (متوسط — padding card)
 * lg  → 24px  (متوسط-بزرگ — gap بین کارت‌ها)
 * xl  → 32px  (بزرگ — gap بین بخش‌ها)
 * 2xl → 48px  (خیلی بزرگ — gap بین بخش‌های اصلی)
 * 3xl → 64px  (عظیم — بین بخش‌های صفحه)
 * 4xl → 96px  (بین بخش‌های Landing)
 * 5xl → 128px (نادر — بین Hero و footer)
 * 6xl → 192px (خیلی نادر)
 */

export const space = {
  // ─── ریز ───
  '3xs': '0.125rem',   // 2px
  '2xs': '0.25rem',    // 4px
  'xs':  '0.5rem',     // 8px

  // ─── کوچک ───
  'sm':  '0.75rem',    // 12px

  // ─── متوسط (پایه) ───
  'md':  '1rem',       // 16px
  'lg':  '1.5rem',     // 24px

  // ─── بزرگ ───
  'xl':  '2rem',       // 32px
  '2xl': '3rem',       // 48px
  '3xl': '4rem',       // 64px

  // ─── عظیم ───
  '4xl': '6rem',       // 96px
  '5xl': '8rem',       // 128px
  '6xl': '12rem',      // 192px
} as const;

// ═══════════════════════════════════════════════
// 🔘 RADIUS
// ═══════════════════════════════════════════════

export const radii = {
  'none': '0',
  'xs':   '0.25rem',   // 4px  — badge، tag ریز
  'sm':   '0.375rem',  // 6px  — input، button کوچک
  'md':   '0.5rem',    // 8px  — button، input معمولی
  'lg':   '0.75rem',   // 12px — card کوچک
  'xl':   '1rem',      // 16px — card اصلی
  '2xl':  '1.5rem',    // 24px — modal، bottomSheet
  '3xl':  '2rem',      // 32px — hero section
  'full': '9999px',
} as const;

// ═══════════════════════════════════════════════
// 📐 SIZES — برای width/height خاص
// ═══════════════════════════════════════════════

export const sizes = {
  // ─── Touch targets (برای موبایل) ───
  'touch-sm': '2.25rem',   // 36px — کمترین قابل قبول
  'touch-md': '2.75rem',   // 44px — استاندارد Apple/Google
  'touch-lg': '3rem',      // 48px — استاندارد Google Material

  // ─── ارتفاع‌های استاندارد کامپوننت ───
  'control-xs': '1.75rem', // 28px — checkbox، radio
  'control-sm': '2rem',    // 32px — button کوچک
  'control-md': '2.5rem',  // 40px — button معمولی، input
  'control-lg': '3rem',    // 48px — button بزرگ، input بزرگ
  'control-xl': '3.25rem', // 52px — CTA

  // ─── عرض/ارتفاع کارت‌ها ───
  'avatar-xs': '1.5rem',   // 24px
  'avatar-sm': '2rem',     // 32px
  'avatar-md': '2.5rem',   // 40px
  'avatar-lg': '3rem',     // 48px
  'avatar-xl': '4rem',     // 64px
  'avatar-2xl': '5rem',    // 80px

  // ─── سایدبارها ───
  'sidebar-sm': '16rem',   // 256px
  'sidebar-md': '18rem',   // 288px
  'sidebar-lg': '20rem',   // 320px
} as const;

// ═══════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════

export const spacingTokens = {
  space,
  radii,
  sizes,
} as const;

// ─── export قدیمی برای سازگاری ───
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
} as const;

export type SpacingTokens = typeof spacingTokens;