'use client';

import { WifiOff, RotateCcw } from 'lucide-react';
import { Button } from '@/components/primitives/Button/Button';

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center select-none bg-background text-foreground" dir="rtl">
      {/* آیکون هشدار قطع اینترنت منطبق بر تم سیستم دیزاین */}
      <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-full mb-4 animate-pulse">
        <WifiOff className="h-10 w-10" />
      </div>
      
      <h1 className="text-base md:text-lg font-black font-iran-yekan mb-2">ارتباط شما با اینترنت قطع شده است</h1>
      
      <p className="text-xs md:text-sm text-muted-foreground font-iran-sans max-w-xs leading-relaxed mb-6">
        برای استفاده از امکانات یدک‌چی نیاز به اتصال فعال شبکه دارید. لطفا اتصال دیتا یا وای‌فای گوشی خود را بررسی کنید.
      </p>

      {/* دکمه تلاش مجدد پنهان روی باکس */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleReload}
        className="rounded-xl font-iran-sans font-bold text-xs h-10 px-5 border-zinc-200 hover:bg-muted text-foreground flex items-center justify-center gap-1.5 shadow-sm"
      >
        <RotateCcw className="h-4 w-4" />
        <span>تلاش مجدد</span>
      </Button>
    </div>
  );
}