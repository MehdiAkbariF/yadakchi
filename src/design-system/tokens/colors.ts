// src/design-system/tokens/colors.ts

/**
 * 🎨 YADAKCHI COLOR SYSTEM v2.0
 * 
 * ساختار:
 * - primitive: رنگ‌های خام (بدون معنا)
 * - semantic: رنگ‌های معنایی (primary, success, danger, ...)
 * - domain: رنگ‌های دامنه‌ای (اختصاصی پروژه یدک‌چی)
 * 
 * قواعد:
 * ۱. در کامپوننت‌ها همیشه از semantic استفاده کن، نه primitive
 * ۲. هر رنگ باید ۱۱ shade داشته باشه
 * ۳. base (500) رنگ اصلیه، بقیه مشتق می‌شن
 */

// ═══════════════════════════════════════════════
// 🎨 PRIMITIVE PALETTE — رنگ‌های خام
// ═══════════════════════════════════════════════

export const primitive = {
  // ─── برند اصلی: نارنجی یدک‌چی ───
  brand: {
    50:  '#FFF4F0',
    100: '#FFE5DA',
    200: '#FFC7B0',
    300: '#FFA180',
    400: '#FF7A50',
    500: '#F56D3C', // ← رنگ اصلی برند
    600: '#E55626',
    700: '#C24319',
    800: '#9A3513',
    900: '#7A2A10',
    950: '#41130A',
  },

  // ─── خاکستری خنثی (Zinc) ───
  neutral: {
    0:   '#FFFFFF',
    50:  '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },

  // ─── سبز (موفقیت) ───
  green: {
    50:  '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E', // ← رنگ پایه موفقیت
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    950: '#052E16',
  },

  // ─── زرد (هشدار) ───
  amber: {
    50:  '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // ← رنگ پایه هشدار
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },

  // ─── قرمز (خطا) ───
  red: {
    50:  '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // ← رنگ پایه خطا
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },

  // ─── آبی (اطلاع‌رسانی) ───
  blue: {
    50:  '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // ← رنگ پایه اطلاعات
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },

  // ─── بنفش (ویژه/پریمیوم) ───
  violet: {
    50:  '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
    950: '#2E1065',
  },

  // ─── فیروزه‌ای (برندهای خاص) ───
  cyan: {
    50:  '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
    950: '#083344',
  },
} as const;

// ═══════════════════════════════════════════════
// 🎭 SEMANTIC TOKENS — رنگ‌های معنایی
// ═══════════════════════════════════════════════

/**
 * این‌ها رنگ‌هایی هستن که در کامپوننت‌ها استفاده می‌کنی
 * هر semantic رنگ از primitive مشتق می‌شه
 */
export const semantic = {
  // ─── برند اصلی ───
  primary: {
    DEFAULT: primitive.brand[500],
    foreground: primitive.neutral[0],
    subtle: primitive.brand[50],
    muted: primitive.brand[100],
    border: primitive.brand[200],
    hover: primitive.brand[600],
    active: primitive.brand[700],
    disabled: primitive.brand[300],
  },

  // ─── پس‌زمینه و متن اصلی ───
  background: {
    DEFAULT: primitive.neutral[0],
    subtle: primitive.neutral[50],
    muted: primitive.neutral[100],
    inverse: primitive.neutral[950],
  },

  foreground: {
    DEFAULT: primitive.neutral[900],   // متن اصلی
    muted: primitive.neutral[600],      // متن فرعی
    subtle: primitive.neutral[400],     // متن بسیار کم‌رنگ
    inverse: primitive.neutral[0],      // متن روی پس‌زمینه تیره
  },

  // ─── کارت و سطوح ───
  card: {
    DEFAULT: primitive.neutral[0],
    foreground: primitive.neutral[900],
    hover: primitive.neutral[50],
    border: primitive.neutral[200],
  },

  // ─── وضعیت‌ها ───
  success: {
    DEFAULT: primitive.green[500],
    foreground: primitive.neutral[0],
    subtle: primitive.green[50],
    muted: primitive.green[100],
    border: primitive.green[200],
    hover: primitive.green[600],
  },

  warning: {
    DEFAULT: primitive.amber[500],
    foreground: primitive.neutral[0],
    subtle: primitive.amber[50],
    muted: primitive.amber[100],
    border: primitive.amber[200],
    hover: primitive.amber[600],
  },

  danger: {
    DEFAULT: primitive.red[500],
    foreground: primitive.neutral[0],
    subtle: primitive.red[50],
    muted: primitive.red[100],
    border: primitive.red[200],
    hover: primitive.red[600],
  },

  info: {
    DEFAULT: primitive.blue[500],
    foreground: primitive.neutral[0],
    subtle: primitive.blue[50],
    muted: primitive.blue[100],
    border: primitive.blue[200],
    hover: primitive.blue[600],
  },

  // ─── بردرها و جداکننده‌ها ───
  border: {
    DEFAULT: primitive.neutral[200],
    subtle: primitive.neutral[100],
    strong: primitive.neutral[300],
    focus: primitive.brand[500],
  },

  // ─── ورودی‌ها ───
  input: {
    DEFAULT: primitive.neutral[200],
    hover: primitive.neutral[300],
    focus: primitive.brand[500],
    error: primitive.red[500],
    disabled: primitive.neutral[100],
  },

  // ─── Ring (حاشیه فوکوس) ───
  ring: {
    DEFAULT: primitive.brand[500],
    offset: primitive.neutral[0],
  },
} as const;

// ═══════════════════════════════════════════════
// 🚗 DOMAIN COLORS — رنگ‌های اختصاصی یدک‌چی
// ═══════════════════════════════════════════════

/**
 * رنگ‌های معنایی مختص دامنه خودرو
 * برای دسته‌بندی قطعات، وضعیت‌های خاص و ...
 */
export const domain = {
  // ─── دسته‌بندی قطعات ───
  partCategory: {
    engine:     primitive.red[600],      // موتور — قرمز تیره
    brake:      primitive.red[500],      // ترمز — قرمز
    electrical: primitive.amber[500],    // برق — زرد
    body:       primitive.cyan[600],     // بدنه — فیروزه‌ای
    audio:      primitive.violet[500],   // صوتی — بنفش
    suspension: primitive.blue[600],     // تعلیق — آبی
    fuel:       primitive.green[600],    // سوخت — سبز
    cooling:    primitive.cyan[500],     // خنک‌کننده — فیروزه‌ای روشن
    interior:   primitive.neutral[600],  // داخل کابین — خاکستری
    exterior:   primitive.neutral[500],  // بیرون کابین
  },

  // ─── وضعیت قطعه ───
  condition: {
    new:      primitive.green[500],      // نو
    stock:    primitive.amber[500],      // استوک
    takeOff:  primitive.red[500],        // دست‌دوم (TakeOff)
  },

  // ─── وضعیت فروشنده ───
  seller: {
    verified: primitive.green[500],      // تایید شده
    pending:  primitive.amber[500],      // در انتظار
    rejected: primitive.red[500],        // رد شده
    featured: primitive.violet[500],     // ویژه
  },

  // ─── برندهای خودرو ───
  carBrand: {
    iranian:  primitive.green[600],      // برندهای ایرانی
    korean:   primitive.blue[600],       // کره‌ای
    japanese: primitive.red[600],        // ژاپنی
    chinese:  primitive.amber[600],      // چینی
    european: primitive.violet[600],     // اروپایی
    american: primitive.cyan[600],       // آمریکایی
  },
} as const;

// ═══════════════════════════════════════════════
// 📤 EXPORTS — برای سازگاری با کد قدیم
// ═══════════════════════════════════════════════

/**
 * export قدیمی برای سازگاری
 * @deprecated از primitive.brand استفاده کن
 */
export const colors = {
  brand: primitive.brand,
  neutral: primitive.neutral,
  primary: primitive.brand,
  secondary: primitive.neutral,
  success: primitive.green,
  warning: primitive.amber,
  error: primitive.red,
} as const;

export type PrimitiveColors = typeof primitive;
export type SemanticColors = typeof semantic;
export type DomainColors = typeof domain;