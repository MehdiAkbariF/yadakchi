// src/design-system/tokens/breakpoints.ts
//
// Mobile-first. مقادیر استاندارد Tailwind حفظ شدهاند.
// `xs` و `3xl` برای پروژهی فعلی لازم نیستن (به دلیل اینکه هیچجا
// استفاده نمیشن) و حذف شدن. اگر بعداً نیاز شد، بهعنوان semantic
// در کامپوننت تعریف کن، نه breakpoint.

export const breakpoints = {
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl': '1536px',
} as const;

export type BreakpointKey = keyof typeof breakpoints;