'use client';

import { Settings, RotateCcw } from 'lucide-react';
import { Button } from '@/components/primitives/Button/Button';

export default function MaintenancePage() {
  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      // بازگشت خودکار به آخرین مسیر کاربر یا رفرش صفحه جهت استعلام مجدد وضعیت ورود و سرور
      window.location.href = '/profile';
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center select-none bg-background text-foreground" dir="rtl">
      
      {/* آیکون چرخ‌دنده انیمیشنی چرخنده جهت القای حس بروزرسانی فنی زنده */}
      <div 
        className="p-4 bg-primary/10 text-primary border border-primary/20 rounded-full mb-4 animate-spin shrink-0"
        style={{ animationDuration: '6s' }}
      >
        <Settings className="h-10 w-10" />
      </div>
      
      <h1 className="text-base md:text-lg font-black font-iran-yekan mb-2">یدک‌چی در حال بروزرسانی است</h1>
      
      <p className="text-xs md:text-sm text-muted-foreground font-iran-sans max-w-sm leading-relaxed mb-6">
        ما در حال بهبود بخش فنی یدک‌چی برای ارائه خدمات سریع‌تر، پایدارتر و امن‌تر هستیم. این فرآیند معمولاً چند دقیقه بیشتر طول نمی‌کشد. از صبر و همراهی صمیمانه شما سپاسگزاریم.
      </p>

      {/* دکمه بررسی مجدد برای بازگشت مستقیم به پنل بدون نیاز به وارد کردن دوباره کلمه عبور یا پیامک */}
      <Button
        variant="primary"
        size="md"
        onClick={handleRetry}
        className="rounded-xl font-iran-sans font-bold text-xs h-10 px-6 shadow-md shadow-primary/10 flex items-center justify-center gap-1.5"
      >
        <RotateCcw className="h-4 w-4" />
        <span>بررسی مجدد وضعیت شبکه</span>
      </Button>
    </div>
  );
}