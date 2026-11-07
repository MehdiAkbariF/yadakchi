export const darkTheme = {
  background:            '#0B0F17', // تم عمیق و بدون خستگی چشم (OLED-friendly)
  foreground:            '#F8FAFC',

  card:                  '#111827', // خاکستری متمایل به آبی تیره لوکس (تضاد عالی با background)
  'card-foreground':     '#F8FAFC',

  popover:               '#111827',
  'popover-foreground':  '#F8FAFC',

  primary:               '#FB923C', // نارنجی درخشان
  'primary-foreground':  '#0B0F17', // متن تیره روی نارنجی روشن = بالاترین کانتراست ممکن
  'primary-hover':       '#FDBA74',
  'primary-active':      '#F97316',

  secondary:             '#1E293B',
  'secondary-foreground':'#F8FAFC',

  muted:                 '#1E293B',
  'muted-foreground':    '#94A3B8', // Slate-400: خوانایی فوق‌العاده در تاریکی بدون زدن چشم

  accent:                '#2D1B13',
  'accent-foreground':   '#FDBA74',

  destructive:           '#EF4444',
  'destructive-foreground':'#FFFFFF',

  success:               '#22C55E',
  'success-foreground':  '#0B0F17',

  warning:               '#FBBF24',
  'warning-foreground':  '#0B0F17',

  info:                  '#38BDF8',
  'info-foreground':     '#0B0F17', // اصلاح شد: روی آبی روشن در دارک‌مد متن تیره خواناست

  border:                '#1E293B', // خطوط مرزی دقیق و شارپ
  input:                 '#334155',
  ring:                  '#FB923C',

  shop:                  '#38BDF8', // آبی درخشان و پرکنتراست
  'shop-foreground':     '#0B0F17', // اصلاح شد: متن تیره برای پاس کردن تست خوانایی
  'shop-hover':          '#7DD3FC',
} as const;