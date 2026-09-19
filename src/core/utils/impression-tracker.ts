// src/core/utils/impression-tracker.ts

import { getHttpClient } from '../http/client';
import { logger } from './logger';

class ProductImpressionTracker {
  private queue: Set<string> = new Set();
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly BATCH_LIMIT = 10;
  private readonly DEBOUNCE_TIME = 1500;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush(true);
        }
      });

      window.addEventListener('pagehide', () => {
        this.flush(true);
      });

      window.addEventListener('beforeunload', () => {
        this.flush(true);
      });
    }
  }

  track(shopProductId: string) {
    if (!shopProductId) return;
    
    this.queue.add(shopProductId);

    console.log('%c[ImpressionTracker] 👁️ بازدید محصول اضافه شد:', 'color: #ea580c; font-weight: bold;', {
      shopProductId
    });

    if (this.queue.size >= this.BATCH_LIMIT) {
      this.flush();
    } else {
      this.resetTimer();
    }
  }

  private resetTimer() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => this.flush(), this.DEBOUNCE_TIME);
  }

  private getFullUrl(endpoint: string): string {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${cleanPath}`;
  }

  private sendDirect(endpoint: string, payload: any, isExiting = false) {
    const url = this.getFullUrl(endpoint);
    const bodyString = JSON.stringify(payload);

    if (isExiting && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([bodyString], { type: 'application/json' });
        if (navigator.sendBeacon(url, blob)) return;
      } catch (e) {}
    }

    if (typeof fetch !== 'undefined') {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyString,
        keepalive: isExiting,
      }).catch((error) => {
        logger.error('[ImpressionTracker] Direct send failed:', error);
      });
    }
  }

  public async flush(isExiting = false) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.queue.size === 0) return;

    const idsToFlush = Array.from(this.queue);
    this.queue.clear();

    const payload = {
      shopProductIds: idsToFlush
    };

    console.log(
      `%c[ImpressionTracker] 🚀 ارسال بازدید محصولات به سرور (${isExiting ? 'هنگام خروج از صفحه' : 'بسته‌ای'}):`,
      'color: #c2410c; font-weight: bold; background: #ffedd5; padding: 3px 8px; border-radius: 4px;',
      payload
    );

    if (isExiting) {
      this.sendDirect('/api/Front/ShopProductView', payload, true);
    } else {
      try {
        const client = getHttpClient();
        await client.post('/api/Front/ShopProductView', payload);
      } catch (error) {
        logger.error('[ImpressionTracker] Failed to send shop product views:', error);
      }
    }
  }
}

export const impressionTracker = new ProductImpressionTracker();

/**
 * تابع ثبت آنی کلیک کالا در زمان هدایت کاربر به صفحه محصول
 * دقیقاً منطبق با سواگر: POST /api/Front/ShopProductClick با شناسه فروشنده برگزیده
 */
export function trackShopProductClick(shopProductId?: string | null) {
  if (!shopProductId) return;

  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
  const url = `${base}/api/Front/ShopProductClick`;
  const payload = { shopProductIds: [shopProductId] };
  const bodyString = JSON.stringify(payload);

  console.log(
    '%c[ShopProductClick] 🎯 ارسال کلیک کالا به سرور:',
    'color: #16a34a; font-weight: bold; background: #dcfce7; padding: 2px 6px; border-radius: 4px;',
    payload
  );

  // ۱. ارسال از طریق sendBeacon (پایدار در زمان تغییر روت)
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const blob = new Blob([bodyString], { type: 'application/json' });
      if (navigator.sendBeacon(url, blob)) return;
    } catch (e) {}
  }

  // ۲. ارسال از طریق fetch با فلگ keepalive
  if (typeof fetch !== 'undefined') {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyString,
      keepalive: true,
    }).catch((err) => {
      logger.error('[ShopProductClick] Failed to send product click:', err);
    });
  }
}