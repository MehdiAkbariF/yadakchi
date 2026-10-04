// src/design-system/tokens/motion.ts

/**
 * 🎬 YADAKCHI MOTION SYSTEM v2.0
 * 
 * اصول:
 * ۱. سرعت‌ها استاندارد (instant → slower)
 * ۲. منحنی‌ها یکدست و قابل پیش‌بینی
 * ۳. حرکات کوچک، هدفمند، بدون اغراق
 * 
 * منابع الهام: Linear، Vercel، Stripe، Radix
 */

// ═══════════════════════════════════════════════
// ⏱️ DURATION
// ═══════════════════════════════════════════════

export const duration = {
  /** 100ms — برای hover, focus */
  instant: 0.1,
  /** 150ms — برای toggle, checkbox */
  fast: 0.15,
  /** 250ms — پیش‌فرض اکثر انیمیشن‌ها */
  normal: 0.25,
  /** 400ms — برای modal, sheet, dropdown */
  slow: 0.4,
  /** 600ms — برای صفحه‌های پیچیده */
  slower: 0.6,
  /** 800ms — برای انیمیشن‌های بزرگ */
  slowest: 0.8,
} as const;

// ═══════════════════════════════════════════════
// 📈 EASING — منحنی‌های شتاب
// ═══════════════════════════════════════════════

export const easing = {
  /**
   * برای ورود اجزا — کند شروع، تند وسط، نرم پایان
   * استاندارد Stripe/Linear
   */
  emphasized: [0.2, 0.0, 0, 1] as [number, number, number, number],
  
  /**
   * برای خروج — تند شروع، نرم پایان
   */
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
  
  /**
   * برای hover و micro-interactions
   */
  standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
  
  /**
   * خطی — فقط برای چرخش‌ها
   */
  linear: [0, 0, 1, 1] as [number, number, number, number],
  
  /**
   * برای برگشت فنری (overshoot)
   */
  anticipate: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
} as const;

// ═══════════════════════════════════════════════
// 🌊 SPRING — برای Framer Motion
// ═══════════════════════════════════════════════

export const spring = {
  /** فنر سبک — برای toggle، checkbox */
  light: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
  },
  
  /** فنر نرم — پیش‌فرض اکثر انیمیشن‌ها */
  soft: {
    type: 'spring' as const,
    stiffness: 200,
    damping: 25,
  },
  
  /** فنر تند — برای hover، tap */
  snappy: {
    type: 'spring' as const,
    stiffness: 500,
    damping: 35,
  },
  
  /** فنر نرم‌تر — برای bottomSheet، modal */
  gentle: {
    type: 'spring' as const,
    stiffness: 260,
    damping: 26,
  },
  
  /** فنر بازیگوش — برای CTA، badge */
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 20,
  },
  
  /** بدون فنر — برای drag */
  none: {
    type: 'tween' as const,
    duration: 0,
  },
} as const;

// ═══════════════════════════════════════════════
// 📏 DISTANCE — فاصله‌های حرکت
// ═══════════════════════════════════════════════

export const distance = {
  '3xs': 2,
  '2xs': 4,
  'xs': 8,
  'sm': 12,
  'md': 16,
  'lg': 24,
  'xl': 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// ═══════════════════════════════════════════════
// 🎭 TRANSITION PRESETS
// ═══════════════════════════════════════════════

export const presets = {
  /** fade — ساده‌ترین */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: duration.normal, ease: easing.standard },
  },
  
  /** fadeInUp — پیش‌فرض برای کارت‌ها */
  fadeInUp: {
    initial: { opacity: 0, y: distance.md },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: distance.md },
    transition: { duration: duration.normal, ease: easing.emphasized },
  },
  
  /** fadeInDown — برای dropdown */
  fadeInDown: {
    initial: { opacity: 0, y: -distance.sm },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -distance.sm },
    transition: { duration: duration.fast, ease: easing.exit },
  },
  
  /** scaleIn — برای modal، popover */
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: duration.fast, ease: easing.emphasized },
  },
  
  /** slideInRight — برای drawer از راست (RTL) */
  slideInRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: spring.gentle,
  },
  
  /** slideInLeft — برای drawer از چپ */
  slideInLeft: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' },
    transition: spring.gentle,
  },
  
  /** slideInBottom — برای bottomSheet */
  slideInBottom: {
    initial: { y: '100%' },
    animate: { y: 0 },
    exit: { y: '100%' },
    transition: spring.gentle,
  },
  
  /** stagger container — برای لیست‌ها */
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  },
  
  /** stagger item — آیتم لیست */
  staggerItem: {
    initial: { opacity: 0, y: distance.sm },
    animate: { opacity: 1, y: 0 },
    transition: { duration: duration.normal, ease: easing.emphasized },
  },
} as const;

// ═══════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════

export const motionTokens = {
  duration,
  easing,
  spring,
  distance,
  presets,
} as const;

export type MotionTokens = typeof motionTokens;