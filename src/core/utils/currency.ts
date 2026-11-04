// src/core/utils/currency.ts

import { toPersianDigits } from './formatters';

export interface FormatCurrencyOptions {
  withUnit?: boolean;
  persianDigits?: boolean;
  fallback?: string;
}

/**
 * 🔹 استخراج امن فقط رقم‌های عددی از هر نوع ورودی (رشته با تومان، ارقام فارسی و...)
 */
export function extractPureNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;

  // تبدیل ارقام فارسی و عربی به انگلیسی
  const enStr = String(value)
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));

  // استخراج فقط ارقام و علامت منفی (حذف کامل حروف مثل تومان، ریال، کاما و...)
  const match = enStr.replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  if (!match) return 0;

  const num = Number(match[0]);
  return isNaN(num) ? 0 : num;
}

/**
 * 🔹 تبدیل عدد ریال به تومان
 * اگر ورودی از قبل برچسب «تومان» داشت، مجدداً تقسیم بر ۱۰ نمی‌شود!
 */
export function rialToToman(rial: number | string | null | undefined): number {
  if (typeof rial === 'string' && rial.includes('تومان')) {
    return extractPureNumber(rial);
  }
  const numericRial = extractPureNumber(rial);
  return Math.floor(numericRial / 10);
}

/**
 * 🔹 تبدیل تومان به ریال
 */
export function tomanToRial(toman: number | string | null | undefined): number {
  const numericToman = extractPureNumber(toman);
  return numericToman * 10;
}

/**
 * 🔹 فرمت ۳ رقمی همراه با اعداد فارسی
 */
export function formatPriceNumber(
  amount: number | string | null | undefined,
  persianDigits = true
): string {
  const num = extractPureNumber(amount);
  const formatted = new Intl.NumberFormat('en-US').format(num);
  return persianDigits ? toPersianDigits(formatted) : formatted;
}

/**
 * 🔹 تبدیل ریال به تومان و فرمت نهایی برای نمایش در UI
 */
export function formatRialToToman(
  rial: number | string | null | undefined,
  options: FormatCurrencyOptions = {}
): string {
  const { withUnit = true, persianDigits = true, fallback } = options;

  if ((rial === null || rial === undefined) && fallback !== undefined) {
    return fallback;
  }

  const toman = rialToToman(rial);
  const formatted = formatPriceNumber(toman, persianDigits);

  return withUnit ? `${formatted} تومان` : formatted;
}