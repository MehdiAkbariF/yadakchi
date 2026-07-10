// src/core/utils/formatters.ts

/**
 * Format date to Persian calendar
 */
export function formatDate(date: Date | string, format: 'full' | 'short' | 'relative' = 'full'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return 'تاریخ نامعتبر';
  }
  
  if (format === 'relative') {
    return formatRelativeTime(d);
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
    ...(format === 'full' && { hour: '2-digit', minute: '2-digit' }),
  };
  
  return new Intl.DateTimeFormat('fa-IR', options).format(d);
}

/**
 * Format relative time (e.g., "۲ ساعت پیش")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) return `${years} سال پیش`;
  if (months > 0) return `${months} ماه پیش`;
  if (days > 0) return `${days} روز پیش`;
  if (hours > 0) return `${hours} ساعت پیش`;
  if (minutes > 0) return `${minutes} دقیقه پیش`;
  return 'چند لحظه پیش';
}

/**
 * Format number with Persian digits
 */
export function formatNumber(value: number, locale: 'fa' | 'en' = 'fa'): string {
  const formatted = new Intl.NumberFormat(
    locale === 'fa' ? 'fa-IR' : 'en-US'
  ).format(value);
  
  return formatted;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'IRR'): string {
  const formatted = formatNumber(amount);
  return `${formatted} ${currency}`;
}

/**
 * Format price in Toman (IRR / 10)
 */
export function formatToman(amount: number): string {
  const toman = amount / 10;
  return `${formatNumber(toman)} تومان`;
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + suffix;
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}