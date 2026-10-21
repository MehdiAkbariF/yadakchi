# UI Conventions — یدکچی

این سند قرارداد رسمی UI پروژه است. هر تغییری در آن نیاز به تأیید دارد.

## ۱. رنگ

- هیچ رنگ hex در کامپوننت ننویس. فقط از توکنهای semantic استفاده کن:
  `bg-background`, `text-foreground`, `bg-primary`, `border-border`, `bg-muted`, ...
- palette (مقیاس 50-950) فقط در `design-system/themes` و `tailwind.config.js` استفاده میشود.
- برای حالتهای hover و active از `bg-primary-hover` و `bg-primary-active` استفاده کن، نه `bg-primary/90`.

## ۲. فاصله

- فقط از مقیاس `tokens/spacing.ts` استفاده کن. `p-[13px]` ممنوع.
- اگر مقدار خارج از مقیاس لازم داری، اول ببین نزدیکترین استاندارد قابل قبول است.

## ۳. Radius

- دکمه، ورودی، Select: `rounded-md`
- کارت و پنل: `rounded-lg`
- مودال و شیت: `rounded-xl`
- بج و آواتار: `rounded-full`

## ۴. Shadow

- فقط `shadow-xs`, `shadow-sm`, `shadow-md`, `shadow-lg`.
- کارت: `shadow-sm`. dropdown: `shadow-md`. مودال: `shadow-lg`.
- در dark mode از `border` بهجای shadow استفاده کن.

## ۵. Typography

- نقشهای تایپوگرافی: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-h4`, `text-body`, `text-body-lg`, `text-lead`, `text-caption`, `text-overline`, `text-reading`.
- در هر صفحه فقط یک `text-h1`.
- برای متن بلند (بلاگ، قوانین): `text-reading` یا `line-height-reading`.

## ۶. RTL

- `ml-*` ممنوع → `ms-*`
- `mr-*` ممنوع → `me-*`
- `pl-*` ممنوع → `ps-*`
- `pr-*` ممنوع → `pe-*`
- `text-left` ممنوع → `text-start` یا حذف (چون `start` = راست در RTL)
- `text-right` ممنوع → حذف (پیشفرض است)
- `left-*`/`right-*` ممنوع → `start-*`/`end-*`

## ۷. Motion

- فقط `duration-fast`, `duration-normal`, `duration-slow`.
- فقط `ease-out`, `ease-in`, `ease-in-out` (تعریفشده در config).
- hover و focus: `duration-fast`
- باز شدن dropdown: `duration-normal`
- مودال: `duration-slow`

## ۸. z-index

- فقط از کلیدهای تعریفشده استفاده کن: `z-sticky`, `z-fixed`, `z-dropdown`, `z-overlay`, `z-modal`, `z-popover`, `z-toast`.
- `z-[9999]` ممنوع.

## ۹. دسترسیپذیری

- همهی `<button>` واقعی باشند، نه `<div onClick>`.
- همهی `<img>` باید `alt` داشته باشند (حتی اگر `""` باشد).
- آیکونتنها باید `aria-label` داشته باشند.
- `:focus-visible` روی همهی تعاملیها باید قابل مشاهده باشد.
- کنتراست متن و پسزمینه باید حداقل WCAG AA (4.5:1) باشد.

## ۱۰. کامپوننت

- هر primitive با `cva` نوشته شود.
- `forwardRef` داشته باشد.
- `displayName` داشته باشد.
- هیچ منطق fetch یا state مدیریتی داخل primitive نباشد.
- `className` همیشه بهعنوان prop پذیرفته شود و با `cn()` ترکیب شود.

## ۱۱. ممنوعیتهای مطلق

- `!important` در className
- `style={{ ... }}` برای چیزهایی که با کلاس قابل انجام است
- `any` در props کامپوننت
- `dark:*` override در variant (باید از CSS var استفاده کند)
- رنگ hex در JSX
- عدد جادویی در `z-index`, `duration`, `spacing`

## ۱۲. در صورت تردید

اول `docs/refactor-log.md` را بخوان. اگر جواب نبود، بپرس — تصمیمهای جدید در همان فایل ثبت میشوند.