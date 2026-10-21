// src/lib/media/constants.ts
/**
 * ثابت‌های سراسری مدیا
 * منبع حقیقت برای placeholder و prefix پروکسی
 */
export const MEDIA_CONSTANTS = {
  /** آدرس پیش‌فرض placeholder */
  defaultPlaceholder: "/images/placeholder.webp",

  /** پیشوند پروکسی داخلی Next.js — rewrites در next.config.js این را به API_BASE_URL منتقل می‌کند */
  proxyPrefix: "/proxy-api",
} as const;

/**
 * میزبان‌هایی که URL کامل از آن‌ها باید پروکسی شود
 * (چون backend / CDN داخلی یدکچی هستند)
 */
export const INTERNAL_MEDIA_HOSTS = [
  "api.yadakchi.local",
  "api.yadakchi.com",
  "cdn.yadakchi.com",
  "yadakchi.local",
  "yadakchi.com",
  "51.158.252.139",
  "172.92.92.237",
] as const;

/**
 * پیشوندهای asset داخلی پروژه (public) که نباید پروکسی شوند
 */
export const INTERNAL_ASSET_PREFIXES = [
  "/_next/",
  "/Font/",
  "/font/",
  "/images/",
  "/image/",
  "/banners/",
  "/banner/",
  "/Logo",
  "/Ylogo",
  "/icon-",
  "/favicon",
  "/video-placeholder",
] as const;