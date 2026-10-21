// src/lib/media/resolver.ts
import {
  MEDIA_CONSTANTS,
  INTERNAL_MEDIA_HOSTS,
  INTERNAL_ASSET_PREFIXES,
} from "./constants";

/**
 * بررسی URL کامل بودن
 */
function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * بررسی اینکه میزبان جزو میزبان‌های داخلی یدکچی است
 */
function isInternalHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  return INTERNAL_MEDIA_HOSTS.some((pattern) => lower.includes(pattern));
}

/**
 * ساخت URL پروکسی از یک مسیر خام
 */
function toProxyUrl(rawPath: string): string {
  const cleaned = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  return `${MEDIA_CONSTANTS.proxyPrefix}${cleaned}`;
}

/**
 * تبدیل هر ورودی مدیا به URL نهایی قابل استفاده در مرورگر
 *
 * ترتیب تصمیم‌گیری:
 *  1. مقدار خالی/نامعتبر       → placeholder
 *  2. data: / blob:            → مستقیم (فایل‌های محلی مرورگر)
 *  3. /proxy-api/...           → دست نمی‌خورد (از قبل پروکسی شده)
 *  4. /_next/, /images/, ...   → دست نمی‌خورد (asset داخلی Next)
 *  5. URL کامل از میزبان داخلی → پروکسی می‌شود
 *  6. URL کامل از میزبان خارجی → مستقیم (بدون پروکسی)
 *  7. مسیر خام                 → پروکسی می‌شود
 */
export function resolveMediaUrl(path: unknown): string {
  // ── ۱. مقادیر نامعتبر ──
  if (path === null || path === undefined) {
    return MEDIA_CONSTANTS.defaultPlaceholder;
  }
  if (typeof path !== "string") {
    return MEDIA_CONSTANTS.defaultPlaceholder;
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return MEDIA_CONSTANTS.defaultPlaceholder;
  }

  // ── ۲. data: / blob: ──
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  // ── ۳. از قبل پروکسی شده ──
  if (trimmed.startsWith(`${MEDIA_CONSTANTS.proxyPrefix}/`)) {
    return trimmed;
  }

  // ── ۴. asset داخلی Next ──
  for (const prefix of INTERNAL_ASSET_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return trimmed;
    }
  }

  // ── ۵ و ۶. URL کامل ──
  if (isAbsoluteUrl(trimmed)) {
    try {
      const urlObj = new URL(trimmed);
      if (isInternalHost(urlObj.hostname)) {
        // میزبان داخلی → استخراج pathname + search و پروکسی
        const pathWithQuery = `${urlObj.pathname}${urlObj.search}`;
        return toProxyUrl(pathWithQuery);
      }
      // میزبان خارجی → مستقیم
      return trimmed;
    } catch {
      // URL نامعتبر → به‌عنوان مسیر خام پروکسی کن
      return toProxyUrl(trimmed);
    }
  }

  // ── ۷. مسیر خام ──
  return toProxyUrl(trimmed);
}

/**
 * alias سازگاری
 */
export const resolveImageUrl = resolveMediaUrl;

/**
 * سازگاری با کدهایی که قبلاً از `getFullUrl` استفاده می‌کردند
 * @deprecated از `resolveMediaUrl` استفاده کن
 */
export function getFullUrl(path: unknown): string {
  return resolveMediaUrl(path);
}

/**
 * خروجی پیشوند پروکسی (برای استفاده‌های خاص)
 */
export function getProxyBaseUrl(): string {
  return MEDIA_CONSTANTS.proxyPrefix;
}