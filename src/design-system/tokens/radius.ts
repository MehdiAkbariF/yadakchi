// src/design-system/tokens/radius.ts
//
// فقط ۵ سطح radius مجاز است. مقادیر دلخواه ممنوع.
//
// نقشها (تصمیم ثابت):
//   sm   → بج کوچک، input درونخطی ریز
//   md   → دکمه، ورودی، Textarea، Select  ← پیشفرض
//   lg   → کارت، پنل، dropdown
//   xl   → مودال، bottom sheet
//   full → آواتار، بج کپسولی، pill
//
// نکته: `none` برای موارد خاص (مثلاً جدول) نگه داشته شده، ولی در
// کامپوننتهای عمومی استفاده نکن.

export const radius = {
  none: '0px',
  sm:   '6px',
  md:   '10px',
  lg:   '14px',
  xl:   '20px',
  full: '9999px',
} as const;

export type RadiusKey = keyof typeof radius;