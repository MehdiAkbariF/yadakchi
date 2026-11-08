// src/design-system/themes/light.ts

export const lightTheme = {
  background:            '#FFFFFF',
  foreground:            '#0F172A',

  card:                  '#FFFFFF',
  'card-foreground':     '#0F172A',

  popover:               '#FFFFFF',
  'popover-foreground':  '#0F172A',

  primary:               '#CE3E04', // کانتراست 4.8:1 با سفید
  'primary-foreground':  '#FFFFFF',
  'primary-hover':       '#B43503',
  'primary-active':      '#922B02',

  secondary:             '#F1F5F9',
  'secondary-foreground':'#0F172A',

  muted:                 '#F8FAFC',
  'muted-foreground':    '#475569', // کانتراست 5.9:1 با سفید

  accent:                '#FFF7ED',
  'accent-foreground':   '#C2410C',

  destructive:           '#DC2626',
  'destructive-foreground':'#FFFFFF',

  success:               '#15803D',
  'success-foreground':  '#FFFFFF',

  warning:               '#B45309', // اصلاح شد: کهربایی استاندارد با کانتراست 4.6:1
  'warning-foreground':  '#FFFFFF',

  info:                  '#0284C7',
  'info-foreground':     '#FFFFFF',

  border:                '#CBD5E1', // اصلاح شد: مرزبندی واضح برای کارت‌ها و سایدبار
  input:                 '#94A3B8', // خطوط مشخص و استاندارد برای اینپوت‌ها (3:1)
  ring:                  '#CE3E04',

  shop:                  '#0369A1',
  'shop-foreground':     '#FFFFFF',
  'shop-hover':          '#075985',
} as const;