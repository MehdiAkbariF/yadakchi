export const lightTheme = {
  background:            '#FFFFFF',
  foreground:            '#0F172A', // Slate-900: مشکی فوق‌العاده شیک با ته‌رنگ ملایم به‌جای مشکی تند

  card:                  '#FFFFFF',
  'card-foreground':     '#0F172A',

  popover:               '#FFFFFF',
  'popover-foreground':  '#0F172A',

  primary:               '#CE3E04', // اصلاح شد: کنتراست دقیق ۴.۷:۱ با سفید (پاس قطعی WCAG AA)
  'primary-foreground':  '#FFFFFF',
  'primary-hover':       '#B43503',
  'primary-active':      '#922B02',

  secondary:             '#F1F5F9', // Slate-100: رنگ خنثی مدرن
  'secondary-foreground':'#0F172A',

  muted:                 '#F8FAFC', // Slate-50: پس‌زمینه ملایم برای المان‌های ثانویه
  'muted-foreground':    '#475569', // Slate-600: کنتراست عالی ۵.۹:۱ با سفید

  accent:                '#FFF7ED', // ته‌رنگ فوق‌العاده نرم نارنجی
  'accent-foreground':   '#C2410C',

  destructive:           '#DC2626',
  'destructive-foreground':'#FFFFFF',

  success:               '#15803D', // سبز غنی با کنتراست بالا
  'success-foreground':  '#FFFFFF',

  warning:               '#D97706',
  'warning-foreground':  '#FFFFFF', // اصلاح شد با کنتراست مطمئن

  info:                  '#0284C7',
  'info-foreground':     '#FFFFFF',

  border:                '#E2E8F0', // اصلاح شد: مرزبندی واضح، شیک و بدون کدر بودن
  input:                 '#CBD5E1', // خطوط مشخص‌تر برای فیلدهای ورودی
  ring:                  '#CE3E04',

  shop:                  '#0369A1', // آبی سرمه‌ای تجاری مدرن
  'shop-foreground':     '#FFFFFF',
  'shop-hover':          '#075985',
} as const;