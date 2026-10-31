export const darkTheme = {
  background:            '#0F1317',
  foreground:            '#F4F6F8',

  card:                  '#151A20',
  'card-foreground':     '#F4F6F8',

  popover:               '#151A20',
  'popover-foreground':  '#F4F6F8',

  primary:               '#F37643',
  'primary-foreground':  '#0F1317', // اصلاح شد: روی پس زمینه نارنجی روشن، متن تیره کنتراست بالاتری دارد
  'primary-hover':       '#F69165',
  'primary-active':      '#EE5717',

  secondary:             '#212831',
  'secondary-foreground':'#F4F6F8',

  muted:                 '#212831',
  'muted-foreground':    '#A8B1BC',

  accent:                '#391A0F',
  'accent-foreground':   '#F8BFAB',

  destructive:           '#EF4444',
  'destructive-foreground':'#FFFFFF',

  success:               '#25B85C',
  'success-foreground':  '#0F1317',

  warning:               '#F59E0B',
  'warning-foreground':  '#0F1317',

  info:                  '#3B82F6',
  'info-foreground':     '#FFFFFF',

  border:                '#2D3643', // اصلاح شد: واضح‌تر شدن بوردرها در دارک مد
  input:                 '#2D3643',
  ring:                  '#F37643',

  shop:                  '#3D94C6',
  'shop-foreground':     '#FFFFFF',
  'shop-hover':          '#5FA6D1',
} as const;