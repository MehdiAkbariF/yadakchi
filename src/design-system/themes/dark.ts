// src/design-system/themes/dark.ts

export const darkTheme = {
  background:            '#0B0F17',
  foreground:            '#F8FAFC',

  card:                  '#111827',
  'card-foreground':     '#F8FAFC',

  popover:               '#111827',
  'popover-foreground':  '#F8FAFC',

  primary:               '#FB923C',
  'primary-foreground':  '#0B0F17',
  'primary-hover':       '#FDBA74',
  'primary-active':      '#F97316',

  secondary:             '#1E293B',
  'secondary-foreground':'#F8FAFC',

  muted:                 '#1E293B',
  'muted-foreground':    '#94A3B8',

  accent:                '#2D1B13',
  'accent-foreground':   '#FDBA74',

  destructive:           '#F87171',
  'destructive-foreground':'#0B0F17', // اصلاح شد: متن تیره روی قرمز روشن

  success:               '#22C55E',
  'success-foreground':  '#0B0F17',

  warning:               '#FBBF24',
  'warning-foreground':  '#0B0F17',

  info:                  '#38BDF8',
  'info-foreground':     '#0B0F17', // متن تیره روی آبی روشن

  border:                '#293548',
  input:                 '#3E4C62',
  ring:                  '#FB923C',

  shop:                  '#38BDF8',
  'shop-foreground':     '#0B0F17',
  'shop-hover':          '#7DD3FC',
} as const;