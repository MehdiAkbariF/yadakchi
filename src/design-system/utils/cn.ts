// src/design-system/utils/cn.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * ترکیب کلاس‌های CSS با هم و merge کردن Tailwind کلاس‌ها
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * تبدیل رنگ به فرمت CSS Variable
 */
export function toCSSVariable(color: string): string {
  return `--${color.replace(/\./g, '-')}`;
}

/**
 * دریافت مقدار CSS Variable
 */
export function getCSSVariable(name: string): string {
  return `var(${toCSSVariable(name)})`;
}