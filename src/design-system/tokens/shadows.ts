// src/design-system/tokens/shadows.ts

/**
 * 🌑 YADAKCHI ELEVATION SYSTEM v2.0
 * 
 * سایه‌ها در ۶ سطح + سایه‌های رنگی
 * 
 * اصول:
 * ۱. سایه‌های کم‌رنگ‌تر برای کارت‌ها
 * ۲. سایه‌های رنگی فقط برای CTA
 * ۳. در دارک مود، سایه‌ها به border تبدیل می‌شن
 */

// ═══════════════════════════════════════════════
// 🎨 NEUTRAL SHADOWS
// ═══════════════════════════════════════════════

export const shadows = {
  // ─── پایه ───
  'none': 'none',
  
  // ─── ۶ سطح elevation ───
  'xs': '0 1px 2px 0 rgb(0 0 0 / 0.04)',
  
  'sm': '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
  
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
  
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)',
  
  'xl': '0 20px 25px -5px rgb(0 0 0 / 0.10), 0 8px 10px -6px rgb(0 0 0 / 0.06)',
  
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
  
  // ─── سایه داخلی ───
  'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  'inner-top': 'inset 0 1px 2px 0 rgb(0 0 0 / 0.06)',
} as const;

// ═══════════════════════════════════════════════
// 🎨 COLORED SHADOWS (برای CTA و Focus)
// ═══════════════════════════════════════════════

export const coloredShadows = {
  // ─── برند ───
  'brand-xs': '0 1px 3px 0 rgb(245 109 60 / 0.20)',
  'brand-sm': '0 2px 8px -2px rgb(245 109 60 / 0.25)',
  'brand-md': '0 8px 24px -4px rgb(245 109 60 / 0.30)',
  'brand-lg': '0 16px 40px -8px rgb(245 109 60 / 0.35)',
  'brand-xl': '0 24px 56px -12px rgb(245 109 60 / 0.40)',

  // ─── موفقیت ───
  'success-sm': '0 2px 8px -2px rgb(34 197 94 / 0.25)',
  'success-md': '0 8px 24px -4px rgb(34 197 94 / 0.30)',

  // ─── خطر ───
  'danger-sm': '0 2px 8px -2px rgb(239 68 68 / 0.25)',
  'danger-md': '0 8px 24px -4px rgb(239 68 68 / 0.30)',

  // ─── هشدار ───
  'warning-sm': '0 2px 8px -2px rgb(245 158 11 / 0.25)',
  'warning-md': '0 8px 24px -4px rgb(245 158 11 / 0.30)',
} as const;

// ═══════════════════════════════════════════════
// 🎯 FOCUS RINGS
// ═══════════════════════════════════════════════

export const focusRings = {
  'brand': '0 0 0 3px rgb(245 109 60 / 0.20)',
  'success': '0 0 0 3px rgb(34 197 94 / 0.20)',
  'danger': '0 0 0 3px rgb(239 68 68 / 0.20)',
  'warning': '0 0 0 3px rgb(245 158 11 / 0.20)',
  'neutral': '0 0 0 3px rgb(161 161 170 / 0.20)',
} as const;

// ═══════════════════════════════════════════════
// 💫 DROP SHADOWS (برای SVG)
// ═══════════════════════════════════════════════

export const dropShadows = {
  'sm': '0 1px 1px rgb(0 0 0 / 0.05)',
  'md': '0 4px 3px rgb(0 0 0 / 0.07)',
  'lg': '0 10px 8px rgb(0 0 0 / 0.04)',
  'xl': '0 20px 13px rgb(0 0 0 / 0.03)',
  '2xl': '0 25px 25px rgb(0 0 0 / 0.15)',
  'none': '0 0 #0000',
} as const;

// ═══════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════

export const elevationTokens = {
  shadows,
  coloredShadows,
  focusRings,
  dropShadows,
} as const;

export type ElevationTokens = typeof elevationTokens;