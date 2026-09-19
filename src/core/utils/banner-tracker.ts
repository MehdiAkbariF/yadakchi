// src/core/utils/banner-tracker.ts

import { getHttpClient } from '../http/client';
import { logger } from './logger';

class BannerImpressionTracker {
  private bannerIds: Set<string> = new Set();
  private shopProductIds: Set<string> = new Set();
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly BATCH_LIMIT = 10;
  private readonly DEBOUNCE_TIME = 1500;

  constructor() {
    if (typeof window !== 'undefined') {
      // ارسال فوری صف به سرور با تغییر تب، بستن مرورگر یا ریدایرکت
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

  /**
   * افزودن شناسه بنر یا کالای تبلیغاتی به صف بازدید (Impression)
   * قانون رفع باگ QA: اگر کالای تبلیغاتی است، فقط و فقط در shopProductIds قرار می‌گیرد.
   */
  track(bannerId?: string | null, shopProductId?: string | null) {
    if (!bannerId && !shopProductId) return;

    if (shopProductId) {
      // بنر تبلیغاتی کالا (Adv Banner) -> منحصراً در shopProductIds
      this.shopProductIds.add(shopProductId);
      console.log('%c[BannerTracker] 👁️ بازدید بنر کالای تبلیغاتی اضافه شد:', 'color: #0284c7; font-weight: bold;', {
        shopProductId
      });
    } else if (bannerId) {
      // بنر معمولی سایت -> منحصراً در bannerIds
      this.bannerIds.add(bannerId);
      console.log('%c[BannerTracker] 👁️ بازدید بنر معمولی اضافه شد:', 'color: #7c3aed; font-weight: bold;', {
        bannerId
      });
    }

    if (this.bannerIds.size >= this.BATCH_LIMIT || this.shopProductIds.size >= this.BATCH_LIMIT) {
      this.flush();
    } else {
      this.resetTimer();
    }
  }

  private resetTimer() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.flush(), this.DEBOUNCE_TIME);
  }

  private getFullUrl(endpoint: string): string {
    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yadakchi.com').replace(/\/$/, '');
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${cleanPath}`;
  }

  /**
   * متد ارسال امن به وب API که حتی در زمان ترک یا ریدایرکت صفحه لغو نمی‌شود
   */
  private sendDirect(endpoint: string, payload: any, isExiting = false) {
    const url = this.getFullUrl(endpoint);
    const bodyString = JSON.stringify(payload);

    // ۱. اولویت با sendBeacon در زمان خروج از صفحه
    if (isExiting && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        const blob = new Blob([bodyString], { type: 'application/json' });
        if (navigator.sendBeacon(url, blob)) return;
      } catch (e) {
        // در صورت بروز خطا به fetch بازگردانده می‌شود
      }
    }

    // ۲. ارسال با fetch همراه با فلگ keepalive جهت جلوگیری از Cancel شدن در ریدایرکت
    if (typeof fetch !== 'undefined') {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyString,
        keepalive: isExiting,
      }).catch((error) => {
        logger.error('[BannerTracker] Direct send failed:', error);
      });
    }
  }

  /**
   * ارسال تجمیع شده بازدیدهای بنرها به سرور
   */
  public async flush(isExiting = false) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.bannerIds.size === 0 && this.shopProductIds.size === 0) return;

    const payload = {
      bannerIds: Array.from(this.bannerIds),
      shopProductIds: Array.from(this.shopProductIds),
    };

    // پاک‌سازی آنی صف‌ها
    this.bannerIds.clear();
    this.shopProductIds.clear();

    console.log(
      `%c[BannerTracker] 🚀 ارسال بازدیدها به سرور (${isExiting ? 'هنگام خروج از صفحه' : 'بسته‌ای'}):`,
      'color: #0369a1; font-weight: bold; background: #e0f2fe; padding: 3px 8px; border-radius: 4px;',
      payload
    );

    if (isExiting) {
      this.sendDirect('/api/Front/BannerView', payload, true);
    } else {
      try {
        const client = getHttpClient();
        await client.post('/api/Front/BannerView', payload);
      } catch (error) {
        logger.error('[BannerTracker] Failed to flush banner views:', error);
      }
    }
  }

  /**
   * ارسال آنی و مستقیم رویداد کلیک بر روی بنرها به سرور
   * قانون رفع باگ QA: اگر کالای تبلیغاتی است، فقط shopProductIds پر می‌شود و bannerIds خالی می‌ماند.
   */
  async trackClick(bannerId?: string | null, shopProductId?: string | null) {
    if (!bannerId && !shopProductId) return;

    const isAdv = !!shopProductId;
    const payload = {
      bannerIds: isAdv ? [] : (bannerId ? [bannerId] : []),
      shopProductIds: isAdv ? [shopProductId] : []
    };

    console.log(
      '%c[BannerTracker] 🎯 ارسال کلیک بنر به سرور (آنی):',
      'color: #047857; font-weight: bold; background: #d1fae5; padding: 3px 8px; border-radius: 4px;',
      payload
    );

    // ارسال فوری همراه با keepalive چون بلافاصله بعد از کلیک ممکن است کاربر ریدایرکت شود
    this.sendDirect('/api/Front/BannerClick', payload, true);
  }
}

export const bannerTracker = new BannerImpressionTracker();