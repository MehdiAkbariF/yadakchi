export const lightTheme = {
  background:            '#FFFFFF',
  foreground:            '#13171F',

  card:                  '#FFFFFF',
  'card-foreground':     '#13171F',

  popover:               '#FFFFFF',
  'popover-foreground':  '#13171F',

  primary:               '#DE4A0E',
  'primary-foreground':  '#FFFFFF',
  'primary-hover':       '#BF3F0B',
  'primary-active':      '#9E3308',

  secondary:             '#F1F4F8',
  'secondary-foreground':'#1E242E',

  muted:                 '#F1F4F8',
  'muted-foreground':    '#555E6C', // اصلاح شد: قبلا #687383 بود

  accent:                '#FEF6F0',
  'accent-foreground':   '#BF3F0B',

  destructive:           '#DC2626',
  'destructive-foreground':'#FFFFFF',

  success:               '#13863E', // اصلاح شد: افزایش کانتراست از 1D9A4C
  'success-foreground':  '#FFFFFF',

  warning:               '#E8920C',
  'warning-foreground':  '#13171F', // اصلاح شد: متن سفید روی این رنگ غیرقابل خواندن بود

  info:                  '#1D64E5',
  'info-foreground':     '#FFFFFF',

  border:                '#D3DAE4', // اصلاح شد: مشخص‌تر شدن خطوط
  input:                 '#D3DAE4',
  ring:                  '#DE4A0E',

  shop:                  '#1E5676',
  'shop-foreground':     '#FFFFFF',
  'shop-hover':          '#16415B',
} as const;