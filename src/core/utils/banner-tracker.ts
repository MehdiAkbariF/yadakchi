// src/core/utils/banner-tracker.ts

import { getHttpClient } from '../http/client';
import { logger } from './logger';

class BannerImpressionTracker {
  private bannerIds: Set<string> = new Set();
  private shopProductIds: Set<string> = new Set();
  private trackedBanners: Set<string> = new Set(); // ✅ جلوگیری از ثبت تکراری
  private trackedProducts: Set<string> = new Set();
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly BATCH_LIMIT = 20; // ✅ افزایش سقف
  private readonly DEBOUNCE_TIME = 3000; // ✅ افزایش زمان برای جمع‌آوری بیشتر

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

  track(bannerId?: string | null, shopProductId?: string | null) {
    if (!bannerId && !shopProductId) return;

    // ✅ جلوگیری از ثبت تکراری
    if (shopProductId) {
      if (this.trackedProducts.has(shopProductId)) return;
      this.trackedProducts.add(shopProductId);
      this.shopProductIds.add(shopProductId);
    } else if (bannerId) {
      if (this.trackedBanners.has(bannerId)) return;
      this.trackedBanners.add(bannerId);
      this.bannerIds.add(bannerId);
    }

    // ✅ فقط وقتی به سقف رسید، ارسال کن
    if (this.bannerIds.size >= this.BATCH_LIMIT || this.shopProductIds.size >= this.BATCH_LIMIT) {
      this.flush();
    } else {
      this.resetTimer();
    }
  }

  private resetTimer() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    // ✅ زمان را افزایش می‌دهیم تا فرصت کافی برای جمع‌آوری داشته باشیم
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
        logger.error('[BannerTracker] Direct send failed:', error);
      });
    }
  }

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

    this.bannerIds.clear();
    this.shopProductIds.clear();

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

  async trackClick(bannerId?: string | null, shopProductId?: string | null) {
    if (!bannerId && !shopProductId) return;

    const isAdv = !!shopProductId;
    const payload = {
      bannerIds: isAdv ? [] : (bannerId ? [bannerId] : []),
      shopProductIds: isAdv ? [shopProductId] : []
    };

    this.sendDirect('/api/Front/BannerClick', payload, true);
  }
}

export const bannerTracker = new BannerImpressionTracker();