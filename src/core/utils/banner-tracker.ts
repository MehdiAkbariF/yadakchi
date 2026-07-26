import { getHttpClient } from '../http/client';
import { logger } from './logger';

class BannerImpressionTracker {
  private bannerIds: Set<string> = new Set();
  private shopProductIds: Set<string> = new Set();
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly BATCH_LIMIT = 10;
  private readonly DEBOUNCE_TIME = 1500;

  /**
   * افزودن شناسه بنر و کالا به صف انباشته بازدید (Impression)
   */
  track(bannerId: string, shopProductId?: string | null) {
    if (bannerId) this.bannerIds.add(bannerId);
    if (shopProductId) this.shopProductIds.add(shopProductId);

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

  /**
   * ارسال تجمیع شده بازدیدهای بنرها به سرور
   */
  private async flush() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.bannerIds.size === 0 && this.shopProductIds.size === 0) return;

    const bannerIdsArray = Array.from(this.bannerIds);
    const shopProductIdsArray = Array.from(this.shopProductIds);

    this.bannerIds.clear();
    this.shopProductIds.clear();

    try {
      const client = getHttpClient();
      logger.debug('[BannerTracker] Flushing batch of banner views:', {
        bannerIds: bannerIdsArray,
        shopProductIds: shopProductIdsArray
      });
      
      await client.post('/api/Front/BannerView', {
        bannerIds: bannerIdsArray,
        shopProductIds: shopProductIdsArray
      });
    } catch (error) {
      logger.error('[BannerTracker] Failed to flush banner views:', error);
    }
  }

  /**
   * ارسال آنی و مستقیم رویداد کلیک بر روی بنرها به سرور
   */
  async trackClick(bannerId: string, shopProductId?: string | null) {
    try {
      const client = getHttpClient();
      logger.debug('[BannerTracker] Tracking banner click:', { bannerId, shopProductId });
      
      await client.post('/api/Front/BannerClick', {
        bannerIds: bannerId ? [bannerId] : [],
        shopProductIds: shopProductId ? [shopProductId] : []
      });
    } catch (error) {
      logger.error('[BannerTracker] Failed to track banner click:', error);
    }
  }
}

export const bannerTracker = new BannerImpressionTracker();