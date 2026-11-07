// src/design-system/tokens/radius.ts
// همگام با globals.css و tailwind.config. تغییر = همه‌جا.

export const radius = {
  none: '0px',
  sm:   '0.375rem',
  md:   '0.625rem',
  lg:   '0.875rem',
  xl:   '1.25rem',
  '2xl':'1.5rem',
  full: '9999px',
} as const;

export type RadiusKey = keyof typeof radius;