import { getHttpClient } from '../http/client';
import { logger } from './logger';

class ProductImpressionTracker {
  private queue: Set<string> = new Set();
  private timeoutId: NodeJS.Timeout | null = null;
  private readonly BATCH_LIMIT = 10; // ارسال بلافاصله پس از جمع شدن ۱۰ آیتم
  private readonly DEBOUNCE_TIME = 1500; // ارسال خودکار پس از ۱.۵ ثانیه سکون اسکرول کاربر

  /**
   * اضافه کردن شناسه محصول فروشگاه به صف بازدید خوش‌بینانه
   */
  track(shopProductId: string) {
    if (!shopProductId) return;
    
    this.queue.add(shopProductId);

    // اگر تعداد صف به لیمیت ۱۰ رسید، فوراً بدون منتظر ماندن تایمر ارسال کن
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

  /**
   * خالی کردن صف و ارسال تکی کل اطلاعات به وب API
   */
  private async flush() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.queue.size === 0) return;

    // کپی شناسه‌ها در قالب آرایه و پاک‌سازی آنی صف برای چرخه بعدی
    const idsToFlush = Array.from(this.queue);
    this.queue.clear();

    try {
      const client = getHttpClient();
      logger.debug('[ImpressionTracker] Sending batch of shop product views:', idsToFlush);
      
      await client.post('/api/Front/ShopProductView', {
        shopProductIds: idsToFlush
      });
    } catch (error) {
      logger.error('[ImpressionTracker] Failed to send shop product views:', error);
    }
  }
}

export const impressionTracker = new ProductImpressionTracker();